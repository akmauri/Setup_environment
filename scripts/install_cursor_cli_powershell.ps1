# Cursor CLI Installation Script for Windows PowerShell
# This script downloads and installs Cursor CLI on Windows

Write-Host "Cursor CLI Installation for Windows" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git Bash is available
$gitBashPath = $null
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitPath = (Get-Command git).Source
    $gitDir = Split-Path (Split-Path $gitPath -Parent) -Parent
    $possibleBashPaths = @(
        Join-Path $gitDir "bin\bash.exe",
        Join-Path $gitDir "usr\bin\bash.exe",
        Join-Path ${env:ProgramFiles} "Git\bin\bash.exe",
        Join-Path ${env:ProgramFiles(x86)} "Git\bin\bash.exe"
    )
    
    foreach ($path in $possibleBashPaths) {
        if (Test-Path $path) {
            $gitBashPath = $path
            break
        }
    }
}

if ($gitBashPath) {
    Write-Host "[OK] Git Bash found: $gitBashPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installing Cursor CLI using Git Bash..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Run the install script in Git Bash
        $installScript = @"
curl https://cursor.com/install -fsS | bash
"@
        
        # Note: Git Bash MINGW64 might not be recognized by install script
        # We'll try it anyway
        & $gitBashPath -c $installScript
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Installation completed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Verifying installation..." -ForegroundColor Yellow
            
            # Refresh PATH
            $machinePath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
            $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
            $env:Path = "$machinePath;$userPath"
            
            # Check if cursor-agent is available
            Start-Sleep -Seconds 2  # Give time for PATH to update
            
            if (Get-Command cursor-agent -ErrorAction SilentlyContinue) {
                cursor-agent --version
                Write-Host ""
                Write-Host "[OK] Cursor CLI installed successfully!" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "⚠ Installation may have succeeded, but cursor-agent is not in PATH yet." -ForegroundColor Yellow
                Write-Host "  Try:" -ForegroundColor Yellow
                Write-Host "  1. Restart PowerShell" -ForegroundColor Cyan
                Write-Host "  2. Or manually add Cursor CLI to your PATH" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "Common installation locations:" -ForegroundColor Yellow
                Write-Host "  - %LOCALAPPDATA%\Programs\cursor\bin\" -ForegroundColor Cyan
                Write-Host "  - %USERPROFILE%\.cursor\bin\" -ForegroundColor Cyan
            }
        } else {
            Write-Host ""
            Write-Host "[WARNING] Installation script failed (Git Bash MINGW64 may not be supported)" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Try these alternatives:" -ForegroundColor Yellow
            Write-Host "  1. Use WSL (if installed): wsl then run: curl https://cursor.com/install -fsS | bash" -ForegroundColor Cyan
            Write-Host "  2. Manual install: Visit https://www.cursor.so/download" -ForegroundColor Cyan
            Write-Host "  3. Check if CLI is in Cursor IDE: Open Command Palette (Ctrl+Shift+P)" -ForegroundColor Cyan
        }
    } catch {
        Write-Host ""
        Write-Host "✗ Installation failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Try manual installation methods (see docs/CURSOR_CLI_INSTALL_WINDOWS.md)" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Git Bash not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation options:" -ForegroundColor Yellow
    Write-Host "  1. Install Git for Windows: https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host "  2. Use WSL (if installed): wsl then run: curl https://cursor.com/install -fsS | bash" -ForegroundColor Cyan
    Write-Host "  3. Manual install: Visit https://www.cursor.so/download" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "See docs/CURSOR_CLI_INSTALL_WINDOWS.md for detailed instructions" -ForegroundColor Cyan
}
