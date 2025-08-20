# Script para fazer deploy das funcoes do Supabase
# Autor: Assistant
# Data: 2025-01-20

Write-Host "Iniciando deploy das funcoes do Google Calendar..." -ForegroundColor Green

# Configuracoes
$projectRef = "viihcrzhrscuujqiwdwm"
$functionsToDeploy = @("connect-google-calendar", "test-calendar-connection")

# Usar npx para executar o Supabase CLI
Write-Host "Fazendo login no Supabase..." -ForegroundColor Yellow
npx supabase login

Write-Host "Linkando o projeto..." -ForegroundColor Yellow
npx supabase link --project-ref $projectRef

# Deploy das funcoes
foreach ($func in $functionsToDeploy) {
    Write-Host "Fazendo deploy da funcao: $func" -ForegroundColor Cyan
    npx supabase functions deploy $func
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deploy da funcao $func concluido com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Erro no deploy da funcao $func" -ForegroundColor Red
    }
}

Write-Host "Deploy finalizado!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs das funcoes deployadas:" -ForegroundColor Yellow
foreach ($func in $functionsToDeploy) {
    Write-Host "  - https://$projectRef.supabase.co/functions/v1/$func" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "1. Configurar os Secrets no dashboard do Supabase" -ForegroundColor White
Write-Host "2. Adicionar URL de callback no Google Cloud Console" -ForegroundColor White
Write-Host "3. Testar as funcoes" -ForegroundColor White