import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaPlansRepository } from '../../../repositories/prisma/prisma-plans-repository.js'

export async function getPlan(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
    const plan = await new PrismaPlansRepository().findById(id)
    return { plan }
}
