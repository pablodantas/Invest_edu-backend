import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaDecentralizationsRepository } from '../../../repositories/prisma/prisma-decentralizations-repository.js'

export async function startDecentralization(req: FastifyRequest, reply: FastifyReply) {
  const body = z.object({
    schoolUnitId: z.string().uuid(),
    planId: z.string().uuid().optional(),
    type: z.enum(['CUSTEIO','CAPITAL']),
    amount: z.number().positive(),
  }).parse(req.body)
  const repo = new PrismaDecentralizationsRepository()
  const dec = await repo.create(body)
  return reply.status(201).send({ decentralization: dec })
}
