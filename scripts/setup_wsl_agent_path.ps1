# Setup WSL PATH for Cursor Agent
# This script adds ~/.local/bin to PATH in WSL

Write-Host "Setting up WSL PATH for Cursor Agent..." -ForegroundColor Cyan
Write-Host ""

# Add to .bashrc if not already there
$setupCommand = @"
if ! echo `$PATH | grep -q `$HOME/.local/bin; then
    echo 'export PATH="`$HOME/.local/bin:`$PATH"' >> ~/.bashrc
    source ~/.bashrc
    echo "PATH updated in .bashrc"
else
    echo "PATH already configured"
fi
"@

wsl bash -c $setupCommand

Write-Host ""
Write-Host "Testing agent command..." -ForegroundColor Yellow
wsl bash -c "export PATH=`$HOME/.local/bin:`$PATH && agent --version"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Agent is working! The orchestrator should now work." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠ Agent command not found. Try:" -ForegroundColor Yellow
    Write-Host "  1. Open WSL: wsl" -ForegroundColor Cyan
    Write-Host "  2. Run: source ~/.bashrc" -ForegroundColor Cyan
    Write-Host "  3. Test: agent --version" -ForegroundColor Cyan
}
