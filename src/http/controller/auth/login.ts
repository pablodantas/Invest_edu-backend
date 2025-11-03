import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { LoginUseCase } from '../../../use-cases/auth/login.js'
import { env } from '../../../env/index.js'
import { InvalidCredentialError } from '../../../use-cases/auth/errors/invalid-credentials-error.js'

export async function login(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }).parse(req.body)

    const { user, rawRefresh } = await new LoginUseCase().execute({
      email, password,
      userAgent: req.headers['user-agent'] ?? null,
      ip: (req.ip ?? null) as any
    })

    const access = await reply.jwtSign({ role: user.role }, { sign: { sub: user.id } })

    const secure = env.NODE_ENV === 'production'
    reply.setCookie('refreshToken', rawRefresh, {
      httpOnly: true, sameSite: 'lax', path: '/', secure,
      maxAge: env.REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60
    })

    return reply.send({ accessToken: access, user: { id: user.id, name: user.name, role: user.role } })
  } catch (err) {
    if (err instanceof InvalidCredentialError) return reply.status(409).send({ messege: err.message })
    throw err
  }
}