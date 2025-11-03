import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import dayjs from 'dayjs'
import { PrismaPlansRepository } from '../../../repositories/prisma/prisma-plans-repository.js'
import { AppError } from '../../../errors/AppError.js'

function mapAssinaturaStatus(planStatus: string, signaturesCount: number): 'ASSINATURA_NAO_ENVIADA' | 'ASSINATURA_ENVIADA' | 'ASSINATURA_CONCLUIDA' {
  if (planStatus === 'COLETA_ASSINATURA') return 'ASSINATURA_ENVIADA'
  if (signaturesCount > 0 && planStatus !== 'COLETA_ASSINATURA') return 'ASSINATURA_CONCLUIDA'
  return 'ASSINATURA_NAO_ENVIADA'
}

export async function getPlanSignatures(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const repo = new PrismaPlansRepository()
  const plan = await repo.findById(id)

  const assinaturaStatus = mapAssinaturaStatus(plan.status, plan.signatures.length)

  const signatures = (plan.signatures ?? []).map((s: any) => ({
    id: s.id,
    nome: s.fullName,
    cargo: s.cargo,
    cpf: s.originNote ?? null, // ⚠️ Usando originNote para armazenar CPF até haver migração
    signedAt: dayjs(s.signedAt).toISOString(),
  }))

  return reply.send({ planId: id, assinaturaStatus, signatures })
}

export async function collectSignature(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const body = z.object({
    kind: z.enum(['PRESIDENTE_CAIXA','TESOUREIRO','OUTRO_MEMBRO','DIRETOR_SUPROT'] as any),
    method: z.enum(['ELETRONICA','UPLOAD','AUTOMATICA'] as any).default('ELETRONICA'),
    imageKey: z.string().optional(),
    nome: z.string().min(3),
    cargo: z.string().min(2),
    cpf: z.string().regex(/^[0-9]{11}$/),
  }).parse(req.body)

  const repo = new PrismaPlansRepository()
  const plan = await repo.findById(id)
  const assinaturaStatus = mapAssinaturaStatus(plan.status, plan.signatures.length)
  if (assinaturaStatus !== 'ASSINATURA_ENVIADA') {
    throw new AppError('Assinatura não está habilitada para este plano.', 422, 'SIGNING_DISABLED')
  }

  const { signature } = await (await import('../../../use-cases/plans/sign-plan.js')).SignPlanUseCase.prototype
  const signer = new (await import('../../../use-cases/plans/sign-plan.js')).SignPlanUseCase(repo as any)
  const res = await signer.execute({
    planId: id,
    signerId: (req.user as any)?.sub ?? null,
    kind: body.kind as any,
    method: body.method as any,
    fullName: body.nome,
    cargo: body.cargo,
    imageKey: body.imageKey ?? null,
    contentHash: plan.payloadHash,
    originNote: body.cpf, // ⚠️ gravando CPF em originNote temporariamente
  } as any)

  return reply.status(201).send({ id: res.signature.id, signedAt: res.signature.signedAt })
}
