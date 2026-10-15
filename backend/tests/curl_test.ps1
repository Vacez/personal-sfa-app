$body = @{
    email = 'user@example.com'
    password = 'password123'
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/auth/login' -Method Post -Body $body -ContentType 'application/json'
Write-Host "LOGGED IN! Token:" $login.token
Write-Host "User:" $login.user.name

$headers = @{
    Authorization = "Bearer $($login.token)"
    Accept = 'application/json'
}

$forecast = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/dashboard/forecast' -Headers $headers
Write-Host "Forecast Quota: JPY" $forecast.quota
Write-Host "Confirmed Sales: JPY" $forecast.confirmed_sales
Write-Host "Projected Finish: JPY" $forecast.projected_finish
Write-Host "Pacing:" $forecast.pacing_percentage "%"
