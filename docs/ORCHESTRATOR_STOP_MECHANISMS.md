# Orchestrator Stop Mechanisms

**Last Updated**: 2026-01-16  
**Purpose**: Document how to stop the orchestrator and prevent endless execution

## Quick Stop Methods

### Method 1: Stop Script (Recommended)

```powershell
npm run orchestrate:stop
```

This PowerShell script will:

- Find all orchestrator processes
- Create a stop signal file for graceful shutdown
- Wait 2 seconds for graceful shutdown
- Force kill any remaining processes
- Optionally clean up locks

### Method 2: Ctrl+C in Terminal

If the orchestrator is running in a **foreground terminal** (not background):

1. Click on the terminal window where orchestrator is running
2. Press `Ctrl+C` once
3. Wait for "Shutting down orchestrator..." message
4. If it doesn't stop after 5 seconds, press `Ctrl+C` again (force exit)

**Note**: If orchestrator is running in background or in a detached terminal, Ctrl+C may not work. Use Method 1 or 3 instead.

### Method 3: Create Stop File

Create a stop signal file to trigger graceful shutdown:

```powershell
New-Item -ItemType File -Path .lock\.orchestrator.stop -Force
```

The orchestrator checks for this file every 5 seconds and will shut down gracefully if it exists.

### Method 4: Kill Process Directly (Last Resort)

If other methods fail:

```powershell
# Find orchestrator PIDs
Get-Process -Name node | Where-Object {
    (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -like '*orchestrate*'
} | Stop-Process -Force
```

## Automatic Stop Mechanisms

The orchestrator automatically stops in these situations:

### 1. Idle Timeout

- **Agent Idle**: Agents with no progress for **15 minutes** are automatically stopped
- **Orchestrator**: Will exit when all agents complete or are stopped

### 2. Task Completion

- Orchestrator exits automatically when all tasks are complete and all agents have exited

### 3. Critical Errors

- Orchestrator exits on critical errors that prevent continuation

## Troubleshooting

### Ctrl+C Not Working

**Symptoms**: Pressing Ctrl+C doesn't stop the orchestrator

**Causes**:

- Orchestrator running in background/detached process
- Terminal not properly connected to stdin
- Windows PowerShell signal handling issues

**Solutions**:

1. Use `npm run orchestrate:stop` instead
2. Create stop file: `.lock\.orchestrator.stop`
3. Kill process directly (Method 4)

### Processes Still Running After Stop

**Symptoms**: Node processes still consuming resources after attempting to stop

**Solutions**:

1. Check if there are multiple orchestrator instances:
   ```powershell
   Get-Process -Name node | Where-Object {
       (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -like '*orchestrate*'
   }
   ```
2. Force kill all orchestrator processes:
   ```powershell
   Get-Process -Name node | Where-Object {
       (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -like '*orchestrate*'
   } | Stop-Process -Force
   ```
3. Clean up locks:
   ```powershell
   npm run locks:cleanup
   ```

### Agents Keep Running After Orchestrator Stops

**Symptoms**: Cursor windows or agent processes continue running after orchestrator stops

**Solutions**:

1. Agents run in separate Cursor windows - close them manually
2. Or use the stop script which attempts to kill agent processes:
   ```powershell
   Get-Process | Where-Object { $_.ProcessName -eq 'Cursor' } | Stop-Process -Force
   ```

## Best Practices

1. **Always use the stop script** when possible (`npm run orchestrate:stop`)
2. **Monitor resource usage** - if orchestrator is idle for > 15 minutes, it should auto-stop agents
3. **Check logs** if stop doesn't work - may indicate a bug that needs fixing
4. **Clean locks after stop** if you're restarting:
   ```powershell
   npm run locks:cleanup
   ```

## Related Documentation

- `agent_rules/resource_management.md` - Rules about preventing endless execution
- `scripts/stop_orchestrator.ps1` - Stop script implementation
- `scripts/orchestrate_agents.js` - Orchestrator implementation with signal handling
