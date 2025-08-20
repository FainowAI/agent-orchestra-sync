# Debug Test - Google Calendar Integration

$supabaseUrl = "https://viihcrzhrscuujqiwdwm.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaWhjcnpocnNjdXVqcWl3ZHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODQ2NzEsImV4cCI6MjA2NjY2MDY3MX0.P7N9wzh_Zm4SkdsLukiAVbe1sfYccVEiS9C_6A4hNls"

Write-Host "DEBUG TEST - GOOGLE CALENDAR" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Teste 1: Verificar se as funcoes estao acessiveis
Write-Host "Teste 1: Verificando funcoes deployadas..." -ForegroundColor Cyan

$testAgentId = "test-agent-12345"

$headers = @{
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
    "apikey" = $anonKey
}

$payload = @{
    agentId = $testAgentId
} | ConvertTo-Json

Write-Host "Agent ID: $testAgentId" -ForegroundColor White
Write-Host "URL: $supabaseUrl/functions/v1/connect-google-calendar" -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/functions/v1/connect-google-calendar" -Method POST -Headers $headers -Body $payload -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
    
} catch {
    Write-Host "ERRO:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Teste 2: Verificando JWT configuracao..." -ForegroundColor Cyan

# Verificar se a funcao precisa de JWT
try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/functions/v1/connect-google-calendar" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $payload -UseBasicParsing
    Write-Host "Funcao acessivel sem JWT" -ForegroundColor Green
} catch {
    Write-Host "Funcao requer JWT (correto)" -ForegroundColor Yellow
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}
