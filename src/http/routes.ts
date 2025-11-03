import { FastifyInstance } from 'fastify'

import { register } from './controller/auth/register.js'
import { login } from './controller/auth/login.js'
import { refresh } from './controller/auth/refresh.js'
import { logout } from './controller/auth/logout.js'
import { resourcesReleasedMetrics } from './controller/metrics/resources/released.js'
import { completedPlansMetrics } from './controller/metrics/plans/completed.js'
import { getPlanSignatures, collectSignature } from './controller/plans/signatures.js'
import { sendPlanToSigning } from './controller/plans/send-to-signing.js'

import { me } from './controller/users/me.js'
import { uploadAvatar } from './controller/users/upload-avatar.js'
import { uploadSignature } from './controller/users/upload-signature.js'

import { createPlan } from './controller/plans/create.js'
import { listPlans } from './controller/plans/list.js'
import { getPlan } from './controller/plans/get.js'
import { submitPlan } from './controller/plans/submit.js'
import { concludePlan } from './controller/plans/conclude.js'
import { signPlan } from './controller/plans/sign.js'
import { planPdf } from './controller/plans/pdf.js'
import { approvePlan } from './controller/plans/approve.js'
import { rejectPlan } from './controller/plans/reject.js'
import { listPlanIssues } from './controller/plans/issues.js'
import { lastRejection } from './controller/plans/last-rejection.js'
import { previewApproval } from './controller/plans/preview-approval.js'
import { returnToDraft } from './controller/plans/return-to-draft.js'

import { listUnits } from "./controller/school-units/list.js";
import { unitBudgetSummary } from './controller/school-units/budget-summary.js'
import { unitApprovedPlans } from './controller/school-units/approved-plans.js'
import { unitBudgetPdf } from './controller/school-units/unit-pdf.js'
import { budgetSummaryV2Controller } from './controller/school-units/budget-summary-v2.js'
import { schoolUnitsSummaryRoutes } from "./controller/school-units/list-summary.js";

import { monthlySummary } from './controller/dashboard/monthly-summary.js'
import { updatePlan } from "./controller/plans/update";

import { listApprovedPlans } from './controller/plans/approved-list.js'
import { importUsers } from './controller/admin/import-users.js'
import { importUnits } from './controller/admin/import-units.js'
import { verifyJWT } from './middlewares/verify-jwt.js'
import { verifyRole } from './middlewares/verify-role.js'
import { unitBudgetSchool } from './controller/school-units/budget-school.js'

import { startDecentralization } from './controller/decentralizations/start.js'
import { concludeDecentralization } from './controller/decentralizations/conclude.js'
import { listDecentralizations } from './controller/decentralizations/list.js'


export async function appRoutes(app: FastifyInstance) {

  app.post('/auth/register', register)
  app.post('/auth/login', login)
  app.post('/auth/refresh', refresh)
  app.post('/auth/logout', logout)

  app.get('/me', { preHandler: [verifyJWT] }, me)
  app.post('/users/me/avatar', { preHandler: [verifyJWT] }, uploadAvatar)
  app.post('/users/me/signature', { preHandler: [verifyJWT] }, uploadSignature)

  app.post('/createplans', { preHandler: [verifyJWT, verifyRole(['ADMIN', 'GESTOR'])] }, createPlan)
  app.get('/plans', { preHandler: [verifyJWT, verifyRole(['ADMIN', 'GESTOR', 'SUPROT', 'DIRETOR_SUPROT'])] }, listPlans)
  app.get('/plans/:id', { preHandler: [verifyJWT] }, getPlan)
  app.get('/plans/:id/issues', { preHandler: [verifyJWT] }, listPlanIssues)
  app.get('/plans/:id/last-rejection', { preHandler: [verifyJWT] }, lastRejection)
  app.post('/plans/:id/submit', { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, submitPlan)
  app.post('/plans/:id/sign', { preHandler: [verifyJWT] }, signPlan)
  app.get('/plans/:id/pdf', { preHandler: [verifyJWT] }, planPdf)
  app.post('/plans/:id/approve', { preHandler: [verifyJWT, verifyRole(['SUPROT', 'DIRETOR_SUPROT', 'ADMIN'])] }, approvePlan)
  app.put("/plans/:id", { preHandler: [verifyJWT] }, updatePlan)
  app.post('/plans/:id/reject', { preHandler: [verifyJWT, verifyRole(['SUPROT', 'DIRETOR_SUPROT', 'ADMIN'])] }, rejectPlan)
  app.get('/plans/:id/preview-approval', { preHandler: [verifyJWT] }, previewApproval)

  app.get("/school-units", { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, listUnits)
  app.get("/school-units/:id/budget/summary", { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, unitBudgetSummary)
  app.patch("/admin/school-units/:id/budget", { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, unitBudgetSchool)

  app.get("/school-units/:id/approved-plans", { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, unitApprovedPlans)
  app.get("/school-units/:id/pdf", { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, unitBudgetPdf)
  app.get("/school-units/summary", { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, schoolUnitsSummaryRoutes)

  app.patch('/plans/approved', { preHandler: [verifyJWT] }, listApprovedPlans)

  app.patch('/plans/:id/status', { preHandler: [verifyJWT] }, returnToDraft)
  app.post('/plans/:id/return', { preHandler: [verifyJWT] }, returnToDraft)
  app.post('/plans/:id/return-to-draft', { preHandler: [verifyJWT] }, returnToDraft)

  app.post('/admin/importar-unidades', { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, importUnits)
  app.post('/admin/importar-usuarios', { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, importUsers)
  app.get('/dashboard/summary', { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, monthlySummary)
  // ---- PATCH: routes adicionais ----
  app.get('/school-units/:id/budget/summary2', { preHandler: [verifyJWT, verifyRole(['ADMIN'])] }, budgetSummaryV2Controller)

  app.post('/plans/:id/conclude', { preHandler: [verifyJWT, verifyRole(['DIRETOR_SUPROT', 'ADMIN'])] }, concludePlan)

  app.post('/decentralizations', { preHandler: [verifyJWT, verifyRole(['SUPROT', 'DIRETOR_SUPROT', 'ADMIN'])] }, startDecentralization)
  app.post('/decentralizations/:id/conclude', { preHandler: [verifyJWT, verifyRole(['SUPROT', 'DIRETOR_SUPROT', 'ADMIN'])] }, concludeDecentralization)
  app.get('/decentralizations', { preHandler: [verifyJWT, verifyRole(['SUPROT', 'DIRETOR_SUPROT', 'ADMIN'])] }, listDecentralizations)
  // ---- PATCH: assinatura & métricas ----
  app.post('/plans/:id/signing/send', { preHandler: [verifyJWT, verifyRole(['DIRETOR_SUPROT', 'ADMIN'])] }, sendPlanToSigning)
  app.get('/plans/:id/signatures', { preHandler: [verifyJWT] }, getPlanSignatures)
  app.post('/plans/:id/signatures', { preHandler: [verifyJWT] }, collectSignature)

  app.get('/metrics/plans/completed', { preHandler: [verifyJWT, verifyRole(['DIRETOR_SUPROT', 'ADMIN'])] }, completedPlansMetrics)
  app.get('/metrics/resources/released', { preHandler: [verifyJWT, verifyRole(['DIRETOR_SUPROT', 'ADMIN'])] }, resourcesReleasedMetrics)
  // ---- FIM PATCH ----

}
