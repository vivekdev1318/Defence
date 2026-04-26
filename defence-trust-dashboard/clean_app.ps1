$content = Get-Content "c:\Users\User\DEFENCE\defence-trust-dashboard\src\App.js"
$first68 = $content[0..67]
Set-Content -Path "c:\Users\User\DEFENCE\defence-trust-dashboard\src\App.js" -Value $first68
Write-Host "App.js cleaned - kept first 68 lines"
