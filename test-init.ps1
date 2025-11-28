# Login และเก็บ token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$token = $loginResponse.access_token

Write-Host "Token: $token"

# เริ่มต้นข้อมูล Master Data
$headers = @{
    "Authorization" = "Bearer $token"
}

$initResponse = Invoke-RestMethod -Uri "http://localhost:3001/master-data/initialize" -Method POST -Headers $headers
Write-Host "Master Data initialized:"
$initResponse

# ดูข้อมูลรถ
$cars = Invoke-RestMethod -Uri "http://localhost:3001/master-data/cars" -Method GET -Headers $headers
Write-Host "`nจำนวนรถทั้งหมด: $($cars.Count)"
$cars | Select-Object -First 5 | Format-Table

# ดูข้อมูลผู้ขาย
$saleMembers = Invoke-RestMethod -Uri "http://localhost:3001/master-data/sale-members" -Method GET -Headers $headers
Write-Host "`nจำนวนผู้ขายทั้งหมด: $($saleMembers.Count)"
$saleMembers | Format-Table
