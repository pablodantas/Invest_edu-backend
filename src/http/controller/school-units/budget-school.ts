import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaBudgetsRepository } from '../../../repositories/prisma/prisma-budgets-repository.js'
import { SetUnitInitialBudgetUseCase } from '../../../use-cases/school-units/set-unit-initial-budget.js'

export async function unitBudgetSchool(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const body = z.object({
    custeioInicial: z.number().min(0),
    capitalInicial: z.number().min(0),
  }).parse(req.body)

  const useCase = new SetUnitInitialBudgetUseCase(new PrismaBudgetsRepository())
  await useCase.execute(id, body)
  return reply.status(204).send()
}