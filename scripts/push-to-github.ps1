# Usage: .\scripts\push-to-github.ps1 -RepoUrl https://github.com/YourUser/YourRepo.git -Message "Initial commit"
param(
  [string]$RepoUrl,
  [string]$Message = "Update"
)

if(-not $RepoUrl){ Write-Host "RepoUrl required"; exit 1 }

git init
git add .
git commit -m $Message

try{
  git remote add origin $RepoUrl -ErrorAction Stop
}catch{
  git remote set-url origin $RepoUrl
}

git branch -M main
git push -u origin main
