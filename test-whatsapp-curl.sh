#!/bin/bash

# Script de teste usando curl para a função create-whatsapp-instance
# 
# Para usar este script:
# 1. Configure as variáveis abaixo
# 2. Execute: chmod +x test-whatsapp-curl.sh && ./test-whatsapp-curl.sh

# ===== CONFIGURAÇÕES - SUBSTITUA PELOS SEUS VALORES =====
SUPABASE_URL="https://sua-url-supabase.supabase.co"
SUPABASE_ANON_KEY="sua-chave-anonima-aqui"
FUNCTION_URL="${SUPABASE_URL}/functions/v1/create-whatsapp-instance"

# Dados de teste
AGENT_ID="test-agent-$(date +%s)"
PHONE_NUMBER="+5511999999999"

echo "🧪 Testando a função create-whatsapp-instance"
echo "=============================================="
echo ""

# Função para fazer uma requisição de teste
test_request() {
    local test_name="$1"
    local data="$2"
    
    echo "📤 $test_name"
    echo "URL: $FUNCTION_URL"
    echo "Dados: $data"
    echo ""
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -d "$data" \
        "$FUNCTION_URL")
    
    # Separar body e status code
    body=$(echo "$response" | sed '$d')
    status_code=$(echo "$response" | tail -n1 | sed 's/HTTP_STATUS://')
    
    echo "📊 Status: $status_code"
    echo "📋 Resposta:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Verificar se jq está instalado
if ! command -v jq &> /dev/null; then
    echo "⚠️ jq não está instalado. Instale para melhor formatação da resposta:"
    echo "   Ubuntu/Debian: sudo apt-get install jq"
    echo "   macOS: brew install jq"
    echo "   Windows: choco install jq"
    echo ""
fi

# Verificar configurações
if [[ "$SUPABASE_URL" == "https://sua-url-supabase.supabase.co" ]]; then
    echo "❌ ERRO: Configure as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no topo do script"
    exit 1
fi

echo "🔍 Configurações:"
echo "   URL: $SUPABASE_URL"
echo "   Função: $FUNCTION_URL"
echo ""

# Teste 1: Requisição válida
test_request "Teste 1: Requisição válida" \
    "{\"agentId\": \"$AGENT_ID\", \"phoneNumber\": \"$PHONE_NUMBER\"}"

# Teste 2: Sem agentId
test_request "Teste 2: Sem agentId (deve falhar)" \
    "{\"phoneNumber\": \"$PHONE_NUMBER\"}"

# Teste 3: Sem phoneNumber
test_request "Teste 3: Sem phoneNumber (deve falhar)" \
    "{\"agentId\": \"$AGENT_ID\"}"

# Teste 4: Dados vazios
test_request "Teste 4: Dados vazios (deve falhar)" \
    "{}"

# Teste 5: JSON inválido
echo "📤 Teste 5: JSON inválido (deve falhar)"
echo "URL: $FUNCTION_URL"
echo "Dados: {invalid json}"
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -d "{invalid json}" \
    "$FUNCTION_URL")

body=$(echo "$response" | sed '$d')
status_code=$(echo "$response" | tail -n1 | sed 's/HTTP_STATUS://')

echo "📊 Status: $status_code"
echo "📋 Resposta:"
echo "$body"
echo ""
echo "----------------------------------------"
echo ""

echo "✅ Testes concluídos!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Verifique se as variáveis de ambiente estão configuradas no Supabase:"
echo "      - EVOLUTION_BASE_URL"
echo "      - EVOLUTION_API_KEY"
echo "      - SUPABASE_URL"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "   2. Se os testes falharem, verifique os logs da função no Supabase Dashboard"
echo ""
echo "   3. Para configurar as variáveis de ambiente:"
echo "      - Acesse o painel do Supabase"
echo "      - Vá em Settings > Edge Functions"
echo "      - Configure as variáveis de ambiente"
echo "      - Faça deploy da função novamente"

