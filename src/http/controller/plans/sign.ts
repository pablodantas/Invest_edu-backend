import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaPlansRepository } from '../../../repositories/prisma/prisma-plans-repository.js'
import { SignHandlerUseCase } from '../../../use-cases/plans/sign-handler.js'

export async function signPlan(req: FastifyRequest, reply: FastifyReply) {
  const params = z.object({ id: z.string().uuid() }).parse(req.params)
  const body = z.object({
    kind: z.enum(['PRESIDENTE_CAIXA','TESOUREIRO','OUTRO_MEMBRO']).or(z.literal('DIRETOR_SUPROT')),
    method: z.enum(['ELETRONICA','UPLOAD']).default('ELETRONICA'),
    imageKey: z.string().optional(),
  }).parse(req.body)

  // Normalmente buscaríamos o hash do payload do plano pelo repositório.
  const repo = new PrismaPlansRepository()
  const plan = await repo.findById(params.id)
  if (!plan) return reply.status(404).send({ message: 'Plano não encontrado' })
  if (!plan.payloadHash) return reply.status(400).send({ message: 'Plano sem payload assinado' })

  const fullName = (req.user as any)?.name ?? 'Assinante'
  const signerId = (req.user as any)?.sub ?? null
  const { signatureId, signedAt } = await new SignHandlerUseCase().execute({
    planId: plan.id,
    signerId,
    kind: body.kind as any,
    method: body.method as any,
    fullName,
    cargo: 'Assinante',
    imageKey: body.imageKey ?? null,
    contentHash: plan.payloadHash,
    originNote: null,
  })
  return reply.status(201).send({ signatureId, signedAt })
}