import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { SubmitPlanUseCase } from '../../../use-cases/plans/submit-plan.js'
import { PrismaPlansRepository } from '../../../repositories/prisma/prisma-plans-repository.js'

export async function submitPlan(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)

  const repo = new PrismaPlansRepository()
  const p = await repo.findById(id)
  const normalized = {
    title: p.title,
    schoolUnitId: p.schoolUnitId,
    descricao: p.description,
    qtdMatriculas: p.qtdMatriculas,
    items: p.items.map((i: any) => ({
      d: i.description, u: i.unidade, q: i.quantidade, vu: Number(i.valorUnitario), t: i.tipo
    })),
    totals: { custeio: Number(p.totalCusteio), capital: Number(p.totalCapital), geral: Number(p.totalGeral) },
  }

  const { payloadHash } = await new SubmitPlanUseCase(repo).execute({
    planId: id, normalizedPayload: normalized, userId: req.user.sub
  })

  return { message: 'Plano enviado para análise', payloadHash }
}
