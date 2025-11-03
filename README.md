# InvestEdu - Backend

Stack: Node 20, Fastify 4, Zod, Prisma 5, PostgreSQL 16 (Docker), JWT (Access + Refresh), Uploads com Sharp, PDFKit.

## Rodando

1. Copie `.env.example` para `.env` e ajuste se necessário.
2. Suba o Postgres e a API:
   ```bash
   docker compose up -d db
   npm i
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```
   A API ficará em `http://localhost:3333`.

## Endpoints principais

- `POST /auth/register` – cadastro de usuário
- `POST /auth/login` – autenticação (retorna `accessToken`, grava refresh em cookie)
- `POST /auth/refresh` – rotaciona refresh
- `POST /auth/logout` – revoga refresh
- `GET /me` – infos do usuário logado
- `POST /users/me/avatar` – upload de avatar (jpg/png até 20MB, compressão automática)
- `POST /users/me/signature` – upload de assinatura
- `POST /plans` – cria plano (itens de CUSTEIO/CAPITAL e cursos)
- `GET /plans` – lista planos (filtros por status/unidade)
- `GET /plans/:id` – detalhes
- `POST /plans/:id/submit` – envia para análise (gera hash)
- `POST /plans/:id/sign` – assina o plano (3 manuais + 1 automática do Diretor SUPROT)
- `GET /plans/:id/pdf` – gera/download do PDF com assinaturas
- `GET /dashboard/summary?year=2025&month=6` – totais mensais

Pastas de upload: `uploads/usuarios` e `uploads/assinaturas` (servidas em `/uploads/...`).

## Observações

- JWT Access curto (configurável em `JWT_EXPIRES_IN`) e Refresh em cookie HttpOnly (rotacionado).
- Hash de integridade do plano (`payloadHash`) calculado ao **submeter**.
- Assinatura do Diretor SUPROT é **aplicada automaticamente** quando as 3 manuais existirem e houver diretor com assinatura cadastrada.
