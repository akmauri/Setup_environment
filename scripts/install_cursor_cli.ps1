# Cursor CLI Installation Helper for Windows
# This script helps install Cursor CLI on Windows using available methods

Write-Host "Cursor CLI Installation Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check for Git Bash
$gitBashPath = $null
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitPath = (Get-Command git).Source
    $gitDir = Split-Path (Split-Path $gitPath -Parent) -Parent
    $possibleBashPaths = @(
        Join-Path $gitDir "bin\bash.exe",
        Join-Path $gitDir "usr\bin\bash.exe",
        Join-Path $env:ProgramFiles "Git\bin\bash.exe",
        Join-Path ${env:ProgramFiles(x86)} "Git\bin\bash.exe"
    )
    
    foreach ($path in $possibleBashPaths) {
        if (Test-Path $path) {
            $gitBashPath = $path
            break
        }
    }
}

# Check for WSL
$wslAvailable = $false
try {
    $wslCheck = wsl --list --quiet 2>&1
    if ($LASTEXITCODE -eq 0) {
        $wslAvailable = $true
    }
} catch {
    $wslAvailable = $false
}

Write-Host "Detection Results:" -ForegroundColor Yellow
if ($gitBashPath) {
    Write-Host "  ✓ Git Bash found: $gitBashPath" -ForegroundColor Green
} else {
    Write-Host "  ✗ Git Bash not found" -ForegroundColor Red
}

if ($wslAvailable) {
    Write-Host "  ✓ WSL available" -ForegroundColor Green
} else {
    Write-Host "  ✗ WSL not available" -ForegroundColor Red
}

Write-Host ""

# Installation options
if ($gitBashPath) {
    Write-Host "Recommended: Install using Git Bash" -ForegroundColor Green
    Write-Host ""
    Write-Host "To install, run in Git Bash:" -ForegroundColor Yellow
    Write-Host "  $gitBashPath -c 'curl https://cursor.com/install -fsS | bash'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or manually:" -ForegroundColor Yellow
    Write-Host "  1. Open Git Bash"
    Write-Host "  2. Run: curl https://cursor.com/install -fsS | bash"
    Write-Host "  3. Verify: cursor-agent --version"
    Write-Host ""
    
    $choice = Read-Host "Run installation now using Git Bash? (Y/N)"
    if ($choice -eq 'Y' -or $choice -eq 'y') {
        Write-Host "Installing..." -ForegroundColor Yellow
        & $gitBashPath -c "curl https://cursor.com/install -fsS | bash"
        
        Write-Host ""
        Write-Host "Verifying installation..." -ForegroundColor Yellow
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        cursor-agent --version
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Cursor CLI installed successfully!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "⚠ Installation may have succeeded, but cursor-agent is not in PATH" -ForegroundColor Yellow
            Write-Host "  Try restarting PowerShell or adding cursor-agent to your PATH manually" -ForegroundColor Yellow
        }
    }
} elseif ($wslAvailable) {
    Write-Host "Alternative: Install using WSL" -ForegroundColor Green
    Write-Host ""
    Write-Host "To install, run in WSL:" -ForegroundColor Yellow
    Write-Host "  wsl" -ForegroundColor Cyan
    Write-Host "  curl https://cursor.com/install -fsS | bash" -ForegroundColor Cyan
    Write-Host "  cursor-agent --version" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Manual Installation Required" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1. Install Git for Windows: https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host "     Then use Git Bash method above"
    Write-Host ""
    Write-Host "  2. Install WSL: wsl --install" -ForegroundColor Cyan
    Write-Host "     Then use WSL method above"
    Write-Host ""
    Write-Host "  3. Visit Cursor website: https://www.cursor.so/download" -ForegroundColor Cyan
    Write-Host "     Look for Windows CLI installer"
    Write-Host ""
}

Write-Host ""
Write-Host "For detailed instructions, see: docs/CURSOR_CLI_INSTALL_WINDOWS.md" -ForegroundColor Cyan
