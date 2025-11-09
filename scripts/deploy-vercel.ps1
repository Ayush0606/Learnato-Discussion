# Usage: .\scripts\deploy-vercel.ps1 -ProjectDir .\frontend -Token <VERCEL_TOKEN>
param(
  [string]$ProjectDir = ".\\frontend",
  [string]$Token
)

if(-not $Token){ Write-Host "VERCEL_TOKEN required"; exit 1 }

# Install vercel if not available
if(-not (Get-Command vercel -ErrorAction SilentlyContinue)){
  npm i -g vercel
}

Push-Location $ProjectDir
$env:VERCEL_TOKEN = $Token
vercel --prod --confirm
Pop-Location
