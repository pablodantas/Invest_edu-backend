InvestEdu é a plataforma de gestão e monitoramento da Educação Profissional da rede pública da Bahia, criada pela SUPROT/NATAD para transformar dados administrativos e financeiros em decisões ágeis e transparentes. Integrando planejamento, execução orçamentária e acompanhamento de processos, o sistema centraliza informações de CUSTEIO e CAPITAL, traz painéis gerenciais por NTE e por unidade escolar, e organiza Planos de Ação com metas, indicadores e trilhas de auditoria. Com perfis e permissões por papel (Gestor Escolar, Equipe Técnica, Administrador), o InvestEdu assegura que cada usuário veja e faça apenas o que lhe compete — incluindo assinaturas digitais (Diretor, Presidente da Caixa Escolar, Tesoureiro) e fluxos aprovativos rastreáveis.

No dia a dia, o InvestEdu reduz retrabalho, padroniza rotinas e dá visibilidade ponta-a-ponta a processos críticos (ingresso, alteração de carga horária, remoção, rescisão REDA, entre outros), conectando cadastros, documentos e evidências de entrega. Os dashboards operacionais e estratégicos exibem execução orçamentária, metas físicas previstas x realizadas e impacto em públicos atendidos, favorecendo governança e prestação de contas.

Tecnologicamente, adota arquitetura moderna com frontend em React e backend em Node.js/Fastify sobre PostgreSQL/Prisma, autenticação com JWT, RBAC, registro de logs e boas práticas de segurança (rate limit, trilhas de auditoria e segregação de camadas). Integra-se a fontes de dados institucionais e a ferramentas analíticas (como Power BI e Google Sheets) para consolidar indicadores em tempo quase real.

Diferenciais-chave

Visão unificada do ciclo: planejar → executar → monitorar → prestar contas.

Metas e indicadores vinculados a Planos de Ação, com comparativo previsto x executado.

Execução orçamentária por unidade/NTE (CUSTEIO/CAPITAL), com alertas e filtros avançados.

Fluxos aprovativos e assinaturas digitais com trilha de auditoria completa.

Perfis e permissões por papel, garantindo segurança e conformidade.

Relatórios e dashboards estratégicos para tomada de decisão e governança.
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
