import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UnitApprovedPlansUseCase } from '../../../use-cases/school-units/unit-approved-plans.js'

export async function unitApprovedPlans(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
    const result = await new UnitApprovedPlansUseCase().execute(id)
    return reply.send(result)
}
