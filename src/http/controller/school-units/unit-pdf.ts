import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UnitBudgetPdfUseCase } from '../../../use-cases/school-units/unit-pdf.js'
import { PrismaSchoolUnitsRepository } from '../../../repositories/prisma/prisma-school-units-repository.js'
import { PrismaBudgetsRepository } from '../../../repositories/prisma/prisma-budgets-repository.js'

export async function unitBudgetPdf(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)

  const { fileName, notFound } = await new UnitBudgetPdfUseCase(
    new PrismaSchoolUnitsRepository(),
    new PrismaBudgetsRepository()
  ).execute(id)

  if (notFound) return reply.status(404).send({ message: 'Unidade não encontrada' })

  return reply.sendFile(fileName)

}