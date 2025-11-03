import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'
import { ReturnToDraftUseCase } from '../../../use-cases/plans/return-to-draft.js'

// PRESERVA A ASSINATURA ORIGINAL ESPERADA PELO routes.ts
// exporta exatamente 'returnToDraft'
export async function returnToDraft(req: FastifyRequest, rep: FastifyReply) {
  const id = (req.params as any).id as string
  const userId = (req as any).user?.sub ?? null

  const IssueSchema = z.object({
    itemId: z.string().uuid(),
    field: z.string().min(1),
    message: z.string().min(1)
  })

  const body = z.object({
    note: z.string().optional().nullable(),
    issues: z.array(IssueSchema).optional().default([])
  }).parse((req as any).body ?? {})

  const useCase = new ReturnToDraftUseCase()
  const result = await useCase.execute({
    planId: id,
    userId,
    note: body.note ?? null,
    issues: body.issues
  })

  return rep.status(200).send(result)
}
