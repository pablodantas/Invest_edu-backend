import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { ConcludePlanUseCase } from '../../../use-cases/plans/conclude-plan.js'

export async function concludePlan(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  // @ts-ignore
  const actorId = (req as any).user?.sub ?? ''
  const result = await new ConcludePlanUseCase().execute({ planId: id, actorId })
  return reply.send(result)
}
