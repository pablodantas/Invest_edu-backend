import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaPlansRepository } from '../../../repositories/prisma/prisma-plans-repository.js'
import { PlanStatus } from '@prisma/client'
import { AppError } from '../../../errors/AppError.js'

export async function sendPlanToSigning(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const repo = new PrismaPlansRepository()
  const plan = await repo.findById(id)

  if (plan.status === 'COLETA_ASSINATURA') {
    throw new AppError('Plano já enviado para coleta de assinatura.', 409, 'SIGNING_ALREADY_ENABLED')
  }

  await repo.updateStatus(id, PlanStatus.COLETA_ASSINATURA, (req.user as any)?.sub, 'Plano enviado para coleta de assinatura')
  return reply.status(200).send({ message: 'ENVIADO PARA COLETA DE ASSINATURA' })
}
