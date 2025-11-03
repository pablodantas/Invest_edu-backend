import { FastifyReply, FastifyRequest } from 'fastify'
import { ListApprovedPlansUseCase } from '../../../use-cases/plans/list-approved-plans.js'

export async function listApprovedPlans(req: FastifyRequest, reply: FastifyReply) {
  const result = await new ListApprovedPlansUseCase(/* repo injected internally */ {} as any).execute()
  return reply.send(result)

}