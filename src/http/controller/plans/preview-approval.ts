import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaBudgetsRepository } from '../../../repositories/prisma/prisma-budgets-repository.js'
import { PreviewApprovalUseCase } from '../../../use-cases/plans/preview-approval.js'

export async function previewApproval(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const result = await new PreviewApprovalUseCase(new PrismaBudgetsRepository()).execute(id)
  return reply.send(result)
}