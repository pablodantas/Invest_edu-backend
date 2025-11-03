import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { ListPlansUseCase } from '../../../use-cases/plans/list-plans.js'

export async function listPlans(req: FastifyRequest, reply: FastifyReply) {
  const query = z.object({
    status: z.enum(['RASCUNHO','EM_ANALISE','EM_ANDAMENTO','APROVADO','REJEITADO']).optional(),
    schoolUnitId: z.string().uuid().optional()
  }).parse(req.query)

  const user: any = (req as any).user
  let schoolUnitId = query.schoolUnitId
  if ((!schoolUnitId) && user?.role === 'GESTOR' && user?.schoolUnitId) {
    schoolUnitId = user.schoolUnitId
  }
  const { plans } = await new ListPlansUseCase().execute({ status: query.status, schoolUnitId })
  return { plans }
}
