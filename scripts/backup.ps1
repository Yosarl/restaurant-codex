param(
  [string]$MongoUri = "mongodb://localhost:27017/restaurant_soft",
  [string]$BackupDir = ".\\backups",
  [int]$RetentionDays = 14
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$target = Join-Path $BackupDir $timestamp

New-Item -ItemType Directory -Path $target -Force | Out-Null
mongodump --uri $MongoUri --out $target

Get-ChildItem $BackupDir -Directory |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } |
  Remove-Item -Recurse -Force

Write-Output "Backup completed at $target"
