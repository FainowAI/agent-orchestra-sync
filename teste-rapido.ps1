# Teste Rápido - Google Calendar Integration
# Execute: .\teste-rapido.ps1

$supabaseUrl = "https://viihcrzhrscuujqiwdwm.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaWhjcnpocnNjdXVqcWl3ZHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODQ2NzEsImV4cCI6MjA2NjY2MDY3MX0.P7N9wzh_Zm4SkdsLukiAVbe1sfYccVEiS9C_6A4hNls"  # Substitua pela sua chave anon

Write-Host "🧪 TESTE RÁPIDO - GOOGLE CALENDAR" -ForegroundColor Yellow
Write-Host ""

# Gerar um Agent ID de teste
$testAgentId = [System.Guid]::NewGuid().ToString()
Write-Host "🆔 Agent ID de teste gerado: $testAgentId" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
    "apikey" = $anonKey
}

$payload = @{
    agentId = $testAgentId
} | ConvertTo-Json

Write-Host "📡 Testando função connect-google-calendar..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/connect-google-calendar" -Method POST -Headers $headers -Body $payload
    
    if ($response.success -and $response.authUrl) {
        Write-Host "✅ SUCESSO! Função está funcionando!" -ForegroundColor Green
        Write-Host "🔗 URL de autorização gerada:" -ForegroundColor Cyan
        Write-Host $response.authUrl -ForegroundColor White
        
        # Abrir no navegador
        Start-Process $response.authUrl
        Write-Host ""
        Write-Host "📱 URL aberta no navegador para autorização" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro: Resposta inesperada" -ForegroundColor Red
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERRO na requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Para testar completamente:" -ForegroundColor Yellow
Write-Host "1. Complete a autorizacao no navegador" -ForegroundColor White
Write-Host "2. Execute: .\test-google-calendar.ps1 -AgentId $testAgentId" -ForegroundColor White
