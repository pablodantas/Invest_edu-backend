import { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../../../env/index.js'
import { RefreshSessionUseCase } from '../../../use-cases/auth/refresh.js'

export async function refresh(req: FastifyRequest, reply: FastifyReply) {
  const raw = req.cookies['refreshToken']
  const result = await new RefreshSessionUseCase().execute(raw)
  if (!result.ok) return reply.status(401).send({ message: 'Refresh inválido' })

  const access = await reply.jwtSign({ role: result.role }, { sign: { sub: result.userId } })

  const secure = env.NODE_ENV === 'production'
  reply.setCookie('refreshToken', result.newRaw, { httpOnly: true, sameSite: 'lax', path: '/', secure })

  return reply.send({ accessToken: access })
}