import { FastifyReply, FastifyRequest } from 'fastify'
import { GetMeUseCase } from '../../../use-cases/users/get-me.js'

export async function me(req: FastifyRequest, reply: FastifyReply) {
  const { user } = await new GetMeUseCase().execute((req as any).user.sub)
  return { user }
}
