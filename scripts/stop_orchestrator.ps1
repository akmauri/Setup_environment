# Stop Orchestrator Script
# Usage: .\scripts\stop_orchestrator.ps1

$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "`n🛑 Stopping orchestrator and agents...`n" -ForegroundColor Yellow

# Find orchestrator processes (node processes running orchestrate_agents.js)
$orchestratorProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    try {
        $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        $cmdLine -like '*orchestrate_agents*' -or $cmdLine -like '*orchestrate*'
    } catch {
        $false
    }
}

if ($orchestratorProcesses) {
    Write-Host "Found $($orchestratorProcesses.Count) orchestrator process(es):" -ForegroundColor Cyan
    foreach ($proc in $orchestratorProcesses) {
        Write-Host "  - PID: $($proc.Id), Started: $($proc.StartTime), Memory: $([math]::Round($proc.WorkingSet/1MB, 2)) MB" -ForegroundColor White
    }
    
    # Create stop file first (for graceful shutdown if orchestrator is checking for it)
    $lockDir = Join-Path $PROJECT_ROOT '.lock'
    $stopFile = Join-Path $lockDir '.orchestrator.stop'
    if (-not (Test-Path $lockDir)) {
        New-Item -ItemType Directory -Path $lockDir -Force | Out-Null
    }
    New-Item -ItemType File -Path $stopFile -Force | Out-Null
    Write-Host "`nCreated stop signal file: $stopFile" -ForegroundColor Yellow
    
    # Wait a moment for graceful shutdown
    Start-Sleep -Seconds 2
    
    # Force kill if still running
    $stillRunning = Get-Process -Id $orchestratorProcesses.Id -ErrorAction SilentlyContinue
    if ($stillRunning) {
        Write-Host "`nForce killing orchestrator processes..." -ForegroundColor Red
        Stop-Process -Id $stillRunning.Id -Force
        Start-Sleep -Seconds 1
    }
    
    Write-Host "✅ Orchestrator stopped" -ForegroundColor Green
} else {
    Write-Host "No orchestrator processes found" -ForegroundColor Gray
}

# Clean up stop file
$lockDir = Join-Path $PROJECT_ROOT '.lock'
$stopFile = Join-Path $lockDir '.orchestrator.stop'
if (Test-Path $stopFile) {
    Remove-Item $stopFile -Force -ErrorAction SilentlyContinue
}

# Optionally clean up locks
# Use a try-catch to handle stdin issues gracefully
try {
    Write-Host "`nClean up all locks? (y/N): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    if ($response -and ($response -eq 'y' -or $response -eq 'Y')) {
        Write-Host "Cleaning up locks..." -ForegroundColor Yellow
        $null = node (Join-Path $PROJECT_ROOT 'scripts' 'manage_locks.js') cleanup --force
        Write-Host "✅ Locks cleaned" -ForegroundColor Green
    }
} catch {
    Write-Host "`nSkipping lock cleanup (non-interactive mode)" -ForegroundColor Gray
    Write-Host "Run 'npm run locks:cleanup' manually if needed" -ForegroundColor Cyan
}

# Small delay to ensure output is flushed before script exits
Start-Sleep -Milliseconds 100

Write-Host "`nDone.`n" -ForegroundColor Green
