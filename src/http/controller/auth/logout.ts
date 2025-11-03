import { FastifyReply, FastifyRequest } from 'fastify'
import { LogoutUseCase } from '../../../use-cases/auth/logout.js'
// 1. Importe a implementação REAL do seu repositório
import { PrismaRefreshTokensRepository } from '../../../repositories/prisma/prisma-refresh-tokens-repository.js' // <-- Ajuste o caminho se necessário

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  try {
    const raw = req.cookies['refreshToken']

    const logoutUseCase = new LogoutUseCase(new PrismaRefreshTokensRepository())

    await logoutUseCase.execute(raw)

    reply.clearCookie('refreshToken', { path: '/' })
    return reply.status(204).send()
    
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}