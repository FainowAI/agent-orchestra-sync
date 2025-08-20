# Exemplo de Configuração Completa

Este documento mostra um exemplo prático de como configurar e testar todo o sistema.

## 🚀 Passo a Passo Completo

### 1. Configurar Evolution API

Primeiro, certifique-se de que sua Evolution API está rodando. Exemplo de teste:

```bash
# Teste básico da Evolution API
curl -X GET "https://sua-evolution-api.com/instance/list" \
  -H "apikey: sua-chave-aqui"
```

### 2. Configurar Variáveis no Supabase

No dashboard do Supabase:

```
EVOLUTION_BASE_URL=https://evolution.exemplo.com
EVOLUTION_API_KEY=B6D875B4-17E5-4A6C-9F8A-8A1234567890
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 3. Criar um Agente de Teste

```sql
-- No SQL Editor do Supabase
INSERT INTO agents (user_id, name, description)
VALUES (
  '12345678-1234-1234-1234-123456789012', -- Substitua pelo seu user_id
  'Agente WhatsApp Teste',
  'Agente para testar integração WhatsApp'
)
RETURNING id;
```

### 4. Configurar o Script de Teste

Edite o arquivo `test-whatsapp-function.ps1`:

```powershell
# Substitua estas variáveis pelos seus valores reais
$SUPABASE_URL = "https://abcdefgh.supabase.co"
$SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### 5. Executar o Teste

```powershell
# No PowerShell
.\test-whatsapp-function.ps1
```

## 📋 Exemplo de Resposta Esperada

### Sucesso:
```json
{
  "success": true,
  "connection": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "agent_id": "12345678-1234-1234-1234-123456789012",
    "phone_number": "+5511999999999",
    "webhook_url": "https://abcdefgh.supabase.co/functions/v1/whatsapp-webhook",
    "status": "disconnected",
    "created_at": "2024-01-17T10:30:00.000Z"
  },
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "instanceName": "agent-12345678-1234-1234-1234-123456789012",
  "instance": {
    "instanceName": "agent-12345678-1234-1234-1234-123456789012",
    "status": "created"
  }
}
```

### Erro típico (configuração incorreta):
```json
{
  "error": "Evolution API credentials not configured"
}
```

## 🔧 Verificações de Diagnóstico

### 1. Verificar se a função está deployada:
```bash
curl -X POST "https://abcdefgh.supabase.co/functions/v1/create-whatsapp-instance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sua-chave-anonima" \
  -d '{"test": "ping"}'
```

### 2. Verificar Evolution API:
```bash
curl -X GET "https://evolution.exemplo.com/instance/list" \
  -H "apikey: B6D875B4-17E5-4A6C-9F8A-8A1234567890"
```

### 3. Verificar banco de dados:
```sql
-- Verificar se há agentes
SELECT id, name, user_id FROM agents LIMIT 5;

-- Verificar conexões WhatsApp
SELECT * FROM whatsapp_connections ORDER BY created_at DESC LIMIT 5;
```

## 🐛 Troubleshooting

### Problema: "Function not found"
**Solução:**
```bash
# Fazer deploy da função
supabase functions deploy create-whatsapp-instance
```

### Problema: "Unauthorized"
**Causa:** Chave de API incorreta
**Solução:** Verificar `SUPABASE_ANON_KEY`

### Problema: "Evolution API error: 401"
**Causa:** `EVOLUTION_API_KEY` incorreta
**Solução:** Verificar a chave na Evolution API

### Problema: "Database error"
**Causa:** RLS ou agentId inexistente
**Solução:** 
1. Verificar se o agentId existe
2. Verificar permissões RLS
3. Usar `SUPABASE_SERVICE_ROLE_KEY` se necessário

## 📱 Próximos Passos

Após criar a instância com sucesso:

1. **Escanear o QR Code** no WhatsApp
2. **Verificar status** da conexão
3. **Testar envio** de mensagens
4. **Configurar webhook** para receber mensagens

### Verificar status da instância:
```bash
curl -X GET "https://evolution.exemplo.com/instance/connectionState/agent-seu-agent-id" \
  -H "apikey: sua-chave"
```

### Enviar mensagem de teste:
```bash
curl -X POST "https://evolution.exemplo.com/message/sendText/agent-seu-agent-id" \
  -H "Content-Type: application/json" \
  -H "apikey: sua-chave" \
  -d '{
    "number": "5511999999999",
    "text": "Olá! Esta é uma mensagem de teste."
  }'
```

## 📊 Monitoramento

### Logs da função:
- Acesse Supabase Dashboard > Edge Functions > create-whatsapp-instance > Logs

### Logs da Evolution API:
- Verifique os logs do seu servidor Evolution API

### Banco de dados:
```sql
-- Monitorar conexões ativas
SELECT 
  a.name as agent_name,
  wc.phone_number,
  wc.status,
  wc.created_at
FROM whatsapp_connections wc
JOIN agents a ON a.id = wc.agent_id
ORDER BY wc.created_at DESC;
```

---

**Dica:** Mantenha este documento atualizado conforme sua configuração específica!

