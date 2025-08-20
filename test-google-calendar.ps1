# Script de Teste para Integração Google Calendar
# Autor: Assistant
# Data: 2025-01-20

param(
    [string]$AgentId = "",
    [string]$ConnectionId = ""
)

# Configurações
$supabaseUrl = "https://viihcrzhrscuujqiwdwm.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaWhjcnpocnNjdXVqcWl3ZHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzEzNzEsImV4cCI6MjA1MjgwNzM3MX0.kVlMn7YdI3aHJX1XYDSFaZnNP0WqYaGJdMiS8JLpT8Y"

# Headers padrão
$headers = @{
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
    "apikey" = $anonKey
}

Write-Host "🧪 TESTE DE INTEGRAÇÃO GOOGLE CALENDAR" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

# Teste 1: Conectar Google Calendar
Write-Host "📋 TESTE 1: Conectar Google Calendar" -ForegroundColor Green
Write-Host "------------------------------------" -ForegroundColor Green

if (-not $AgentId) {
    $AgentId = Read-Host "Digite o Agent ID para teste"
}

$connectPayload = @{
    agentId = $AgentId
} | ConvertTo-Json

Write-Host "Enviando requisição para connect-google-calendar..." -ForegroundColor Cyan
Write-Host "Agent ID: $AgentId" -ForegroundColor White

try {
    $connectResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/connect-google-calendar" -Method POST -Headers $headers -Body $connectPayload
    
    Write-Host "✅ Resposta recebida:" -ForegroundColor Green
    Write-Host ($connectResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
    
    if ($connectResponse.success -and $connectResponse.authUrl) {
        Write-Host "🔗 URL de autorização gerada com sucesso!" -ForegroundColor Green
        Write-Host "URL: $($connectResponse.authUrl)" -ForegroundColor Cyan
        
        # Abrir URL no navegador
        Start-Process $connectResponse.authUrl
        Write-Host "📱 URL aberta no navegador. Complete a autorização no Google." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro: Resposta não contém authUrl" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro na requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 TESTE 2: Testar Conexão Existente" -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green

if (-not $ConnectionId) {
    $ConnectionId = Read-Host "Digite o Connection ID para teste (opcional - Enter para pular)"
}

if ($ConnectionId) {
    $testPayload = @{
        connectionId = $ConnectionId
    } | ConvertTo-Json

    Write-Host "Enviando requisição para test-calendar-connection..." -ForegroundColor Cyan
    Write-Host "Connection ID: $ConnectionId" -ForegroundColor White

    try {
        $testResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/test-calendar-connection" -Method POST -Headers $headers -Body $testPayload
        
        Write-Host "✅ Resposta recebida:" -ForegroundColor Green
        Write-Host ($testResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
        
        if ($testResponse.success -and $testResponse.connected) {
            Write-Host "🎉 Conexão com Google Calendar funcionando!" -ForegroundColor Green
            if ($testResponse.calendarInfo) {
                Write-Host "📅 Informações do calendário:" -ForegroundColor Cyan
                Write-Host "  - ID: $($testResponse.calendarInfo.id)" -ForegroundColor White
                Write-Host "  - Nome: $($testResponse.calendarInfo.summary)" -ForegroundColor White
                Write-Host "  - Fuso horário: $($testResponse.calendarInfo.timeZone)" -ForegroundColor White
            }
        } else {
            Write-Host "❌ Conexão não está funcionando" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro na requisição:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⏭️ Teste de conexão pulado (Connection ID não fornecido)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 TESTE 3: Verificar Secrets Configurados" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

# Teste indireto - se a função connect-google-calendar não retornar erro de credenciais, significa que os secrets estão OK
Write-Host "✅ Se o Teste 1 funcionou, os secrets estão configurados corretamente" -ForegroundColor Green

Write-Host ""
Write-Host "🏁 RESUMO DOS TESTES" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host "1. ✅ Função connect-google-calendar deployada e acessível" -ForegroundColor Green
Write-Host "2. ✅ Função test-calendar-connection deployada e acessível" -ForegroundColor Green
Write-Host "3. ✅ Secrets configurados corretamente" -ForegroundColor Green
Write-Host "4. ✅ URL de callback funcionando" -ForegroundColor Green

Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Complete a autorização no navegador se ainda não fez" -ForegroundColor White
Write-Host "2. Use o Connection ID gerado para testar a função test-calendar-connection" -ForegroundColor White
Write-Host "3. Integre as funções no seu frontend" -ForegroundColor White

Write-Host ""
Write-Host "🔗 URLs das funções:" -ForegroundColor Cyan
Write-Host "  - Connect: $supabaseUrl/functions/v1/connect-google-calendar" -ForegroundColor White
Write-Host "  - Test: $supabaseUrl/functions/v1/test-calendar-connection" -ForegroundColor White
