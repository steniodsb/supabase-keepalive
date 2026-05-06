# Supabase Keep-Alive

Mantém projetos Supabase do plano gratuito ativos, evitando a pausa automática por inatividade (que ocorre após ~7 dias sem requisições).

## Como funciona

Um workflow do GitHub Actions roda 2x por semana (segunda e quinta às 12:00 UTC) e faz uma requisição `GET` no endpoint `/rest/v1/` de cada projeto listado em `projects.json`. Esse endpoint retorna o schema OpenAPI e funciona em qualquer projeto Supabase, sem depender de tabela específica.

Se algum projeto falhar, o workflow sai com erro e o GitHub envia notificação por e-mail.

## Adicionar um novo projeto

1. Edite `projects.json` adicionando uma nova entrada:

   ```json
   {
     "name": "MEU_PROJETO",
     "url": "https://xxxxxxxxxxxxxxxxxxxx.supabase.co",
     "key": "${SUPABASE_KEY_MEU_PROJETO}"
   }
   ```

2. No GitHub, crie um secret no repositório:
   - **Settings → Secrets and variables → Actions → New repository secret**
   - Nome: `SUPABASE_KEY_MEU_PROJETO` (convenção: `SUPABASE_KEY_<NOME_EM_MAIUSCULO>`)
   - Valor: a `anon` key do projeto Supabase

3. Adicione a referência ao secret em `.github/workflows/keepalive.yml`, no bloco `env:`:

   ```yaml
   SUPABASE_KEY_MEU_PROJETO: ${{ secrets.SUPABASE_KEY_MEU_PROJETO }}
   ```

## Convenção de nomes dos secrets

`SUPABASE_KEY_<NOME_DO_PROJETO_EM_MAIUSCULO>`

O `<NOME>` deve bater exatamente com o campo `name` do `projects.json` (em maiúsculo, sem espaços, com underscore se precisar separar).

## Rodar localmente

1. Crie um arquivo `.env` na raiz com as keys:

   ```
   SUPABASE_KEY_PROJETO1=eyJhbGciOi...
   SUPABASE_KEY_PROJETO2=eyJhbGciOi...
   ```

2. Rode com Node 20+ usando o flag nativo `--env-file`:

   ```bash
   node --env-file=.env scripts/ping.js
   ```

   Ou, equivalente:

   ```bash
   npm run ping  # exige exportar as vars manualmente
   ```

## Disparar manualmente no GitHub

**Actions → Supabase Keep-Alive → Run workflow**

## Estrutura

```
├── .github/workflows/keepalive.yml   # Cron + trigger manual
├── projects.json                     # Lista de projetos (URLs + placeholders das keys)
├── scripts/ping.js                   # Script de ping (Node puro, sem deps)
├── package.json
└── README.md
```
