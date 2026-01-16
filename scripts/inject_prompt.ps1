# PowerShell script to inject prompt into Cursor Claude Code chat
# Usage: .\scripts\inject_prompt.ps1 -PromptFile "path\to\prompt.md" -Delay 3000

param(
    [Parameter(Mandatory=$true)]
    [string]$PromptFile,
    
    [Parameter(Mandatory=$false)]
    [int]$Delay = 3000  # Delay in milliseconds before injecting (default 3 seconds)
)

# Add types for Windows API with enhanced activation methods
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WindowHelper {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool BringWindowToTop(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
    [DllImport("kernel32.dll")]
    public static extern uint GetCurrentThreadId();
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    [DllImport("user32.dll")]
    public static extern bool AllowSetForegroundWindow(int dwProcessId);
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    [DllImport("user32.dll")]
    public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
    
    public static int SW_RESTORE = 9;
    public static int SW_SHOW = 5;
    public static int SW_MAXIMIZE = 3;
    public static int SW_SHOWNORMAL = 1;
    public static IntPtr HWND_TOP = new IntPtr(0);
    public static uint SWP_SHOWWINDOW = 0x0040;
    public static uint WM_ACTIVATE = 0x0006;
}
"@

Add-Type -AssemblyName System.Windows.Forms

# Wait for Cursor window to be ready
Start-Sleep -Milliseconds $Delay

# Find Cursor window by process name
# If multiple Cursor windows exist, get the most recently opened one
$cursorProcesses = Get-Process | Where-Object { 
    $_.ProcessName -eq "Cursor" -or 
    $_.ProcessName -eq "cursor"
} | Sort-Object StartTime -Descending

if ($cursorProcesses.Count -eq 0) {
    Write-Host "❌ Cursor process not found. Make sure Cursor is running." -ForegroundColor Red
    exit 1
}

# Use the most recently opened Cursor window (likely the one just spawned)
$cursorProcess = $cursorProcesses | Select-Object -First 1

if ($cursorProcesses.Count -gt 1) {
    Write-Host "ℹ️  Found $($cursorProcesses.Count) Cursor windows. Using most recent (PID: $($cursorProcess.Id))" -ForegroundColor Cyan
}

if ($null -eq $cursorProcess) {
    Write-Host "❌ Cursor process not found. Make sure Cursor is running." -ForegroundColor Red
    exit 1
}

# Get the Cursor window handle
$hwnd = $cursorProcess.MainWindowHandle

if ($hwnd -eq [IntPtr]::Zero) {
    Write-Host "❌ Could not get Cursor window handle. Window may not be ready yet." -ForegroundColor Red
    exit 1
}

# Calculate relative path for the prompt file
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Normalize paths
$fullPromptPath = [System.IO.Path]::GetFullPath($PromptFile)
$fullProjectRoot = [System.IO.Path]::GetFullPath($projectRoot)

# Calculate relative path
$relativePromptPath = $fullPromptPath.Replace($fullProjectRoot, "").Replace("\", "/").TrimStart("/")

# Build the @ reference command
$atReference = "@$relativePromptPath"

Write-Host "🎯 Targeting Cursor window (PID: $($cursorProcess.Id), Handle: $hwnd)" -ForegroundColor Cyan
Write-Host "📝 Prompt reference: $atReference" -ForegroundColor Cyan

# AGGRESSIVE WINDOW ACTIVATION: Ensure Cursor is active before sending keys
# This function tries multiple methods to activate the window
function ActivateCursorWindow {
    param($hwnd, $processId, [int]$maxRetries = 10)
    
    $retries = 0
    $activated = $false
    
    while ($retries -lt $maxRetries -and -not $activated) {
        $retries++
        Write-Host "  Attempt ${retries}/${maxRetries}: Activating Cursor window..." -ForegroundColor Cyan
        
        # Method 1: Restore if minimized
        if ([WindowHelper]::IsIconic($hwnd)) {
            [WindowHelper]::ShowWindow($hwnd, [WindowHelper]::SW_RESTORE)
            Start-Sleep -Milliseconds 200
        }
        
        # Method 2: Allow foreground window change (required for Windows 10+)
        [WindowHelper]::AllowSetForegroundWindow($processId)
        
        # Method 3: Use AttachThreadInput to force focus (more aggressive)
        $foregroundWindow = [WindowHelper]::GetForegroundWindow()
        if ($foregroundWindow -ne [IntPtr]::Zero) {
            $currentThreadId = [WindowHelper]::GetCurrentThreadId()
            $foregroundThreadId = [WindowHelper]::GetWindowThreadProcessId($foregroundWindow, [ref]$null)
            
            if ($currentThreadId -ne $foregroundThreadId) {
                [WindowHelper]::AttachThreadInput($foregroundThreadId, $currentThreadId, $true)
                [WindowHelper]::SetForegroundWindow($hwnd)
                [WindowHelper]::AttachThreadInput($foregroundThreadId, $currentThreadId, $false)
            } else {
                [WindowHelper]::SetForegroundWindow($hwnd)
            }
        } else {
            [WindowHelper]::SetForegroundWindow($hwnd)
        }
        
        # Method 4: Multiple activation methods
        [WindowHelper]::BringWindowToTop($hwnd)
        [WindowHelper]::ShowWindow($hwnd, [WindowHelper]::SW_SHOWNORMAL)
        [WindowHelper]::SetWindowPos($hwnd, [WindowHelper]::HWND_TOP, 0, 0, 0, 0, [WindowHelper]::SWP_SHOWWINDOW)
        
        # Wait for activation
        Start-Sleep -Milliseconds 300
        
        # Verify window is actually active now
        $activeWindow = [WindowHelper]::GetForegroundWindow()
        if ($activeWindow -eq $hwnd) {
            $activated = $true
            Write-Host "  ✅ Cursor window is now active!" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Window not active yet, retrying..." -ForegroundColor Yellow
            Start-Sleep -Milliseconds 500
        }
    }
    
    if (-not $activated) {
        Write-Host "  ⚠️  Could not activate Cursor window after $maxRetries attempts" -ForegroundColor Yellow
        Write-Host "     Attempting to click on window..." -ForegroundColor Yellow
        
        # Fallback: Try clicking on the window to activate it
        # Get window rect and click center
        try {
            # Try to use existing WindowRect if already defined
            $null = [WindowRect]
        } catch {
            Add-Type -TypeDefinition @"
            public class WindowRect {
            [System.Runtime.InteropServices.DllImport("user32.dll")]
            public static extern bool GetWindowRect(System.IntPtr hWnd, out RECT lpRect);
            [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)]
            public struct RECT {
                public int Left;
                public int Top;
                public int Right;
                public int Bottom;
            }
            }
"@
        }
        
        $rect = New-Object WindowRect+RECT
        if ([WindowRect]::GetWindowRect($hwnd, [ref]$rect)) {
            $centerX = ($rect.Left + $rect.Right) / 2
            $centerY = ($rect.Top + $rect.Bottom) / 2
            
            # Use Add-Type to get SendInput for clicking
            try {
                # Try to use existing MouseClick if already defined
                $null = [MouseClick]
            } catch {
                Add-Type -TypeDefinition @"
                public class MouseClick {
                [System.Runtime.InteropServices.DllImport("user32.dll")]
                public static extern bool SetCursorPos(int X, int Y);
                [System.Runtime.InteropServices.DllImport("user32.dll")]
                public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
                public static uint MOUSEEVENTF_LEFTDOWN = 0x02;
                public static uint MOUSEEVENTF_LEFTUP = 0x04;
                }
"@
            }
            
            # Click on window center
            [MouseClick]::SetCursorPos($centerX, $centerY)
            Start-Sleep -Milliseconds 100
            [MouseClick]::mouse_event([MouseClick]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
            Start-Sleep -Milliseconds 50
            [MouseClick]::mouse_event([MouseClick]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
            Start-Sleep -Milliseconds 300
            
            # Check again
            $activeWindow = [WindowHelper]::GetForegroundWindow()
            if ($activeWindow -eq $hwnd) {
                $activated = $true
                Write-Host "  ✅ Cursor window activated via click!" -ForegroundColor Green
            }
        }
    }
    
    return $activated
}

# Activate Cursor window (aggressive, with retries and click fallback)
Write-Host "🔧 Activating Cursor window..." -ForegroundColor Cyan
$activated = ActivateCursorWindow -hwnd $hwnd -processId $cursorProcess.Id

# Final verification: Check if window is actually active before sending keys
$activeWindow = [WindowHelper]::GetForegroundWindow()
if ($activeWindow -ne $hwnd) {
    Write-Host "⚠️  WARNING: Cursor window is not active!" -ForegroundColor Red
    Write-Host "   Attempting one more aggressive activation..." -ForegroundColor Yellow
    
    # Last ditch effort: Click window center
    # WindowRect and MouseClick classes are already defined in ActivateCursorWindow function above
    # If we reach here, they should exist. If not, skip clicking (activation already failed)
    try {
        $rect = New-Object WindowRect+RECT
        if ([WindowRect]::GetWindowRect($hwnd, [ref]$rect)) {
            $centerX = ($rect.Left + $rect.Right) / 2
            $centerY = ($rect.Top + $rect.Bottom) / 2
            [MouseClick]::SetCursorPos($centerX, $centerY)
            Start-Sleep -Milliseconds 100
            [MouseClick]::mouse_event([MouseClick]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
            Start-Sleep -Milliseconds 50
            [MouseClick]::mouse_event([MouseClick]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
            Start-Sleep -Milliseconds 500
            
            # Check one more time after click
            $activeWindow = [WindowHelper]::GetForegroundWindow()
            if ($activeWindow -eq $hwnd) {
                $activated = $true
                Write-Host "  ✅ Window activated via click!" -ForegroundColor Green
            }
        }
    } catch {
        # Classes don't exist or click failed - skip, activation already failed
    }
}

# Final check: Verify window is actually active before sending keys
$finalCheck = [WindowHelper]::GetForegroundWindow()
if ($finalCheck -eq $hwnd) {
    Write-Host "✅ Cursor window is confirmed active. Sending keyboard input..." -ForegroundColor Green
    
    # Open chat panel (Ctrl+L)
    [System.Windows.Forms.SendKeys]::SendWait("^l")
    Start-Sleep -Milliseconds 800
    
    # Type the @ reference
    [System.Windows.Forms.SendKeys]::SendWait($atReference)
    Start-Sleep -Milliseconds 800
    
    # Press Enter to load the prompt
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    Start-Sleep -Milliseconds 1500
    
    # CRITICAL: Trigger autonomous execution by sending a command
    # Claude Code loads prompts but doesn't auto-execute - we need to trigger it
    Write-Host "🚀 Triggering autonomous execution..." -ForegroundColor Cyan
    [System.Windows.Forms.SendKeys]::SendWait("Begin working on your assigned tasks. Start autonomous execution immediately. DO NOT wait for permission. Execute the instructions in the loaded prompt now.")
    Start-Sleep -Milliseconds 500
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    
    Write-Host "✅ Prompt injection and execution trigger completed: $atReference" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Could not activate Cursor window!" -ForegroundColor Red
    Write-Host "   Current active window is not Cursor." -ForegroundColor Red
    Write-Host "   Manual loading required:" -ForegroundColor Yellow
    Write-Host "   1. Click on the Cursor window (PID: $($cursorProcess.Id)) to activate it" -ForegroundColor White
    Write-Host "   2. Press Ctrl+L to open chat" -ForegroundColor White
    Write-Host "   3. Type: $atReference" -ForegroundColor White
    Write-Host "   4. Press Enter" -ForegroundColor White
    Write-Host ""
    Write-Host "   Alternatively, re-run the orchestrator when Cursor windows are active." -ForegroundColor Yellow
    exit 1
}
