import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaPlanFlowRepository } from '../../../repositories/prisma/prisma-plan-flow-repository.js'
import { LastRejectionUseCase } from '../../../use-cases/plans/last-rejection.js'

export async function lastRejection(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const { rejection } = await new LastRejectionUseCase(new PrismaPlanFlowRepository()).execute(id)
  return { rejection }
}