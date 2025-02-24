# Function to get latest package version
function Get-LatestNpmVersion {
    param(
        [string]$packageName
    )
    
    try {
        $version = (npm show $packageName version)
        Write-Host "${packageName}: $version" -ForegroundColor Green
    }
    catch {
        Write-Host "Error checking ${packageName}: $_" -ForegroundColor Red
    }
}

# List of packages to check
$packages = @(
    "react",
    "react-dom",
    "next",
    "typescript",
    "eslint",
    "eslint-config-next",
    "tailwindcss",
    "postcss",
    "@types/react",
    "@types/react-dom",
    "@types/node"
)

Write-Host "Checking latest versions of packages..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

foreach ($package in $packages) {
    Get-LatestNpmVersion $package
}

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Version check complete!" -ForegroundColor Cyan