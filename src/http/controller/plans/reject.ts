import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { RejectPlanUseCase } from '../../../use-cases/plans/reject-plan.js'

const IssueSchema = z.object({
  itemId: z.string().uuid().optional().nullable(),
  field: z.string().min(1),
  message: z.string().min(1),
})

export async function rejectPlan(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const body = z.object({ reason: z.string().min(1), issues: z.array(IssueSchema).default([]) }).parse(req.body ?? {})
  // @ts-ignore
  const approverId = req.user.sub
  const { plan } = await new RejectPlanUseCase().execute({ planId: id, approverId, reason: body.reason, issues: body.issues })
  return { plan }
}
