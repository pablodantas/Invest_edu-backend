import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaDecentralizationsRepository } from '../../../repositories/prisma/prisma-decentralizations-repository.js'

export async function concludeDecentralization(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const repo = new PrismaDecentralizationsRepository()
  const dec = await repo.conclude(id)
  return reply.send({ decentralization: dec })
}
