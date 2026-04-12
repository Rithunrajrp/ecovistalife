# PowerShell script to set up local subdomains for development
# Run this script as Administrator

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$entries = @"

# EcoVistaLife Local Development Subdomains
127.0.0.1       portal.localhost
127.0.0.1       admin.localhost
"@

# Check if entries already exist
$hostsContent = Get-Content $hostsPath -Raw
if ($hostsContent -notmatch "portal\.localhost") {
    Add-Content -Path $hostsPath -Value $entries
    Write-Host "Subdomain entries added to hosts file!" -ForegroundColor Green
} else {
    Write-Host "Subdomain entries already exist in hosts file." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Local development URLs:" -ForegroundColor Cyan
Write-Host "  Main site:  http://localhost:3000"
Write-Host "  Portal:     http://portal.localhost:3000"
Write-Host "  Admin:      http://admin.localhost:3000"
Write-Host ""
Write-Host "Make sure to restart your browser after adding hosts entries."
