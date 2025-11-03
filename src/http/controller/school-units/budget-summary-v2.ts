import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { unitBudgetSummaryV2 } from '../../../use-cases/school-units/unit-budget-summary-v2.js'

export async function budgetSummaryV2Controller(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const { id } = paramsSchema.parse(req.params)

  const result = await unitBudgetSummaryV2(id)
  return reply.status(200).send(result)
}
