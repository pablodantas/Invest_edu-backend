import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaBudgetsRepository } from '../../../repositories/prisma/prisma-budgets-repository.js'
import { UnitBudgetSummaryUseCase } from '../../../use-cases/school-units/unit-budget-summary.js'


export async function unitBudgetSummary(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const result = await new UnitBudgetSummaryUseCase(new PrismaBudgetsRepository()).execute(id)
  return reply.send({
    unidadeId: id,
    ...result,
    saldoInicialTotal: result.custeio.inicial + result.capital.inicial,
    comprometidoTotal: result.custeio.comprometido + result.capital.comprometido,
    disponivelTotal: result.custeio.disponivel + result.capital.disponivel,
  })
}