import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { ApprovePlanUseCase } from '../../../use-cases/plans/approve-plan.js'

export async function approvePlan(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
    // @ts-ignore
    const approverId = (req as any).user?.sub ?? ''
        try {
  const { plan } = await new ApprovePlanUseCase().execute({ planId: id, approverId })
  return { plan }
} catch (e: any) {
  if (e && e.name === 'InsufficientBudgetError' && e.details) {
    return reply.status(422).send(e.details)
  }
  throw e
}

}
