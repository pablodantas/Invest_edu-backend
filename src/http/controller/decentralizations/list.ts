import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaDecentralizationsRepository } from '../../../repositories/prisma/prisma-decentralizations-repository.js'

export async function listDecentralizations(req: FastifyRequest, reply: FastifyReply) {
  const query = z.object({
    schoolUnitId: z.string().uuid(),
    status: z.enum(['PENDENTE','CONCLUIDA']).optional()
  }).parse(req.query)

  const repo = new PrismaDecentralizationsRepository()
  const list = await repo.list({ schoolUnitId: query.schoolUnitId, status: query.status as any })
  return reply.send({ decentralizations: list })
}
