import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MonthlySummaryUseCase } from '../../../use-cases/dashboard/monthly-summary.js'

export async function monthlySummary(req: FastifyRequest, reply: FastifyReply) {
    const { year, month } = z.object({
      year: z.coerce.number().int(),
      month: z.coerce.number().int().min(1).max(12)
    }).parse(req.query)
    return new MonthlySummaryUseCase().execute({ year, month })
}