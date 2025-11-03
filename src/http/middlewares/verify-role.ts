import { FastifyReply, FastifyRequest } from 'fastify'

export function verifyRole(roles: Array<'ADMIN' | 'GESTOR' | 'SUPROT' | 'DIRETOR_SUPROT'>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user
    if (!user || !roles.includes(user.role)) {
      return reply.status(403).send({ message: 'Acesso negado' })
    }
  }
}
