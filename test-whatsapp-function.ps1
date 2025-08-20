# Script de teste PowerShell para a função create-whatsapp-instance
# 
# Para usar este script:
# 1. Configure as variáveis abaixo
# 2. Execute: .\test-whatsapp-function.ps1

# ===== CONFIGURAÇÕES - SUBSTITUA PELOS SEUS VALORES =====
$SUPABASE_URL = "https://sua-url-supabase.supabase.co"
$SUPABASE_ANON_KEY = "sua-chave-anonima-aqui"
$FUNCTION_URL = "$SUPABASE_URL/functions/v1/create-whatsapp-instance"

# Dados de teste
$AGENT_ID = "test-agent-$(Get-Date -Format 'yyyyMMddHHmmss')"
$PHONE_NUMBER = "+5511999999999"

Write-Host "🧪 Testando a função create-whatsapp-instance" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""

# Função para fazer uma requisição de teste
function Test-Request {
    param(
        [string]$TestName,
        [hashtable]$Data
    )
    
    Write-Host "📤 $TestName" -ForegroundColor Cyan
    Write-Host "URL: $FUNCTION_URL"
    Write-Host "Dados: $($Data | ConvertTo-Json -Compress)"
    Write-Host ""
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $SUPABASE_ANON_KEY"
        }
        
        $response = Invoke-RestMethod -Uri $FUNCTION_URL -Method POST -Headers $headers -Body ($Data | ConvertTo-Json) -ErrorAction Stop
        
        Write-Host "📊 Status: 200 (Sucesso)" -ForegroundColor Green
        Write-Host "📋 Resposta:"
        $response | ConvertTo-Json -Depth 10
        
        if ($response.success) {
            Write-Host "🎉 Sucesso! Instância criada com sucesso" -ForegroundColor Green
            if ($response.qrcode) {
                Write-Host "📱 QR Code recebido para autenticação" -ForegroundColor Green
            }
        }
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = ""
        
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            $reader.Close()
            $stream.Close()
        } catch {
            $errorBody = "Erro ao ler resposta"
        }
        
        Write-Host "📊 Status: $statusCode (Erro)" -ForegroundColor Red
        Write-Host "📋 Resposta de erro:"
        try {
            $errorJson = $errorBody | ConvertFrom-Json
            $errorJson | ConvertTo-Json -Depth 10
        } catch {
            Write-Host $errorBody
        }
    }
    
    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host ""
}

# Verificar configurações
if ($SUPABASE_URL -eq "https://sua-url-supabase.supabase.co") {
    Write-Host "❌ ERRO: Configure as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no topo do script" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Configurações:"
Write-Host "   URL: $SUPABASE_URL"
Write-Host "   Função: $FUNCTION_URL"
Write-Host ""

# Teste 1: Requisição válida
Test-Request "Teste 1: Requisição válida" @{
    agentId = $AGENT_ID
    phoneNumber = $PHONE_NUMBER
}

# Teste 2: Sem agentId
Test-Request "Teste 2: Sem agentId (deve falhar)" @{
    phoneNumber = $PHONE_NUMBER
}

# Teste 3: Sem phoneNumber
Test-Request "Teste 3: Sem phoneNumber (deve falhar)" @{
    agentId = $AGENT_ID
}

# Teste 4: Dados vazios
Test-Request "Teste 4: Dados vazios (deve falhar)" @{}

Write-Host "✅ Testes concluídos!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Verifique se as variáveis de ambiente estão configuradas no Supabase:"
Write-Host "      - EVOLUTION_BASE_URL"
Write-Host "      - EVOLUTION_API_KEY"
Write-Host "      - SUPABASE_URL"
Write-Host "      - SUPABASE_SERVICE_ROLE_KEY"
Write-Host ""
Write-Host "   2. Se os testes falharem, verifique os logs da função no Supabase Dashboard"
Write-Host ""
Write-Host "   3. Para configurar as variáveis de ambiente:"
Write-Host "      - Acesse o painel do Supabase"
Write-Host "      - Vá em Settings > Edge Functions"
Write-Host "      - Configure as variáveis de ambiente"
Write-Host "      - Faça deploy da função novamente"

