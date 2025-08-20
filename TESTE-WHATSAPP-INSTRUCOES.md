# Instruções para Testar a Função WhatsApp

Este documento contém instruções detalhadas para testar e configurar a função `create-whatsapp-instance`.

## 📋 Pré-requisitos

1. **Supabase configurado** com a função deployada
2. **Evolution API** rodando e acessível
3. **Variáveis de ambiente** configuradas no Supabase

## 🔧 Configuração das Variáveis de Ambiente

No painel do Supabase, configure as seguintes variáveis:

### No Supabase Dashboard:
1. Acesse **Settings** > **Edge Functions**
2. Clique em **Environment Variables**
3. Adicione as seguintes variáveis:

```
EVOLUTION_BASE_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-da-evolution-api
SUPABASE_URL=https://sua-url-supabase.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

## 🧪 Como Executar os Testes

### Opção 1: PowerShell (Windows)
```powershell
# 1. Edite o arquivo test-whatsapp-function.ps1
# 2. Configure as variáveis SUPABASE_URL e SUPABASE_ANON_KEY
# 3. Execute:
.\test-whatsapp-function.ps1
```

### Opção 2: JavaScript/Node.js
```bash
# 1. Edite o arquivo test-whatsapp-function.js
# 2. Configure as variáveis no topo do arquivo
# 3. Execute:
node test-whatsapp-function.js
```

### Opção 3: curl (Linux/macOS/WSL)
```bash
# 1. Edite o arquivo test-whatsapp-curl.sh
# 2. Configure as variáveis no topo do arquivo
# 3. Execute:
chmod +x test-whatsapp-curl.sh
./test-whatsapp-curl.sh
```

### Opção 4: Teste Manual com curl
```bash
curl -X POST \
  https://sua-url-supabase.supabase.co/functions/v1/create-whatsapp-instance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sua-chave-anonima" \
  -d '{
    "agentId": "test-agent-123",
    "phoneNumber": "+5511999999999"
  }'
```

## 📊 Interpretando os Resultados

### ✅ Sucesso Esperado
```json
{
  "success": true,
  "connection": {
    "id": "uuid-da-conexao",
    "agent_id": "test-agent-123",
    "phone_number": "+5511999999999",
    "status": "disconnected"
  },
  "qrcode": "data:image/png;base64,...",
  "instanceName": "agent-test-agent-123",
  "instance": { ... }
}
```

### ❌ Erros Comuns e Soluções

#### 1. "Evolution API credentials not configured"
**Problema:** Variáveis de ambiente não configuradas
**Solução:** Configure `EVOLUTION_BASE_URL` e `EVOLUTION_API_KEY`

#### 2. "agentId and phoneNumber are required"
**Problema:** Parâmetros obrigatórios não fornecidos
**Solução:** Verifique se está enviando `agentId` e `phoneNumber`

#### 3. "Evolution API error: 401"
**Problema:** Chave da API inválida
**Solução:** Verifique a `EVOLUTION_API_KEY`

#### 4. "Evolution API error: 404"
**Problema:** URL da Evolution API incorreta
**Solução:** Verifique a `EVOLUTION_BASE_URL`

#### 5. "Database error"
**Problema:** Erro no Supabase (RLS, permissões, etc.)
**Solução:** Verifique se o `agentId` existe na tabela `agents`

## 🔍 Debugging

### 1. Verificar Logs da Função
1. Acesse **Supabase Dashboard**
2. Vá em **Edge Functions**
3. Clique na função `create-whatsapp-instance`
4. Veja a aba **Logs**

### 2. Verificar Evolution API
```bash
# Teste se a Evolution API está respondendo
curl -X GET \
  https://sua-evolution-api.com/instance/list \
  -H "apikey: sua-chave-da-evolution-api"
```

### 3. Verificar Conexão com Banco
```sql
-- No SQL Editor do Supabase
SELECT * FROM agents LIMIT 5;
SELECT * FROM whatsapp_connections LIMIT 5;
```

## 🚀 Deploy da Função

Se você fez alterações na função, faça o deploy:

```bash
# Usando Supabase CLI
supabase functions deploy create-whatsapp-instance
```

## 📱 Testando com um Agente Real

1. **Crie um agente primeiro:**
```sql
INSERT INTO agents (user_id, name, description)
VALUES (auth.uid(), 'Agente Teste', 'Agente para teste');
```

2. **Use o ID do agente nos testes**

3. **Verifique se a conexão foi criada:**
```sql
SELECT * FROM whatsapp_connections WHERE agent_id = 'seu-agent-id';
```

## 🔒 Segurança

- **Nunca** commit chaves de API nos arquivos de teste
- Use apenas em ambiente de **desenvolvimento/teste**
- Valide todos os inputs antes de usar em produção

## 📞 Suporte

Se os testes continuarem falhando:

1. Verifique todas as configurações acima
2. Consulte os logs do Supabase
3. Teste a Evolution API diretamente
4. Verifique as permissões do banco de dados

---

**Última atualização:** $(Get-Date -Format 'dd/MM/yyyy HH:mm')

