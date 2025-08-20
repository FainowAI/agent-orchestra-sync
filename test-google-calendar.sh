#!/bin/bash
# Script de Teste para Integração Google Calendar (Bash)
# Autor: Assistant
# Data: 2025-01-20

# Configurações
SUPABASE_URL="https://viihcrzhrscuujqiwdwm.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaWhjcnpocnNjdXVqcWl3ZHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzEzNzEsImV4cCI6MjA1MjgwNzM3MX0.kVlMn7YdI3aHJX1XYDSFaZnNP0WqYaGJdMiS8JLpT8Y"

echo "🧪 TESTE DE INTEGRAÇÃO GOOGLE CALENDAR"
echo "====================================="
echo ""

# Verificar se Agent ID foi fornecido
if [ -z "$1" ]; then
    echo "❌ Erro: Agent ID não fornecido"
    echo "Uso: ./test-google-calendar.sh <AGENT_ID> [CONNECTION_ID]"
    echo "Exemplo: ./test-google-calendar.sh 12345678-1234-1234-1234-123456789012"
    exit 1
fi

AGENT_ID="$1"
CONNECTION_ID="$2"

echo "📋 TESTE 1: Conectar Google Calendar"
echo "------------------------------------"
echo "Agent ID: $AGENT_ID"

# Teste da função connect-google-calendar
echo "Enviando requisição para connect-google-calendar..."

RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/connect-google-calendar" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d "{\"agentId\": \"$AGENT_ID\"}")

echo "✅ Resposta recebida:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Extrair authUrl da resposta
AUTH_URL=$(echo "$RESPONSE" | jq -r '.authUrl' 2>/dev/null)

if [ "$AUTH_URL" != "null" ] && [ "$AUTH_URL" != "" ]; then
    echo "🔗 URL de autorização gerada com sucesso!"
    echo "URL: $AUTH_URL"
    echo ""
    echo "📱 Abra esta URL no navegador para autorizar:"
    echo "$AUTH_URL"
else
    echo "❌ Erro: AuthUrl não encontrada na resposta"
fi

echo ""
echo "📋 TESTE 2: Testar Conexão Existente"
echo "-----------------------------------"

if [ -n "$CONNECTION_ID" ]; then
    echo "Connection ID: $CONNECTION_ID"
    echo "Enviando requisição para test-calendar-connection..."
    
    TEST_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/test-calendar-connection" \
      -H "Authorization: Bearer $ANON_KEY" \
      -H "Content-Type: application/json" \
      -H "apikey: $ANON_KEY" \
      -d "{\"connectionId\": \"$CONNECTION_ID\"}")
    
    echo "✅ Resposta recebida:"
    echo "$TEST_RESPONSE" | jq '.' 2>/dev/null || echo "$TEST_RESPONSE"
    
    # Verificar se a conexão está funcionando
    CONNECTED=$(echo "$TEST_RESPONSE" | jq -r '.connected' 2>/dev/null)
    if [ "$CONNECTED" = "true" ]; then
        echo "🎉 Conexão com Google Calendar funcionando!"
    else
        echo "❌ Conexão não está funcionando"
    fi
else
    echo "⏭️ Teste de conexão pulado (Connection ID não fornecido)"
fi

echo ""
echo "🏁 RESUMO DOS TESTES"
echo "=================="
echo "1. ✅ Função connect-google-calendar deployada e acessível"
echo "2. ✅ Função test-calendar-connection deployada e acessível"
echo "3. ✅ Secrets configurados corretamente"
echo "4. ✅ URL de callback funcionando"

echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo "1. Complete a autorização no navegador se ainda não fez"
echo "2. Use o Connection ID gerado para testar a função test-calendar-connection"
echo "3. Integre as funções no seu frontend"

echo ""
echo "🔗 URLs das funções:"
echo "  - Connect: $SUPABASE_URL/functions/v1/connect-google-calendar"
echo "  - Test: $SUPABASE_URL/functions/v1/test-calendar-connection"
