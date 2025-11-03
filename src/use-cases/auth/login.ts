import { AuthenticateUseCase } from './authenticate.js'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository.js'
import { PrismaRefreshTokensRepository } from '../../repositories/prisma/prisma-refresh-tokens-repository.js'
import { sha256 } from '../../utils/crypto.js'
import crypto from 'node:crypto'
import dayjs from 'dayjs'
import { env } from '../../env/index.js'

/**
 * Responsável por autenticar o usuário e emitir o refresh token (persistido via repositório).
 * Mantém a lógica de segurança fora do Controller.
 */
export class LoginUseCase {
  private auth = new AuthenticateUseCase(new PrismaUsersRepository())
  private refreshRepo = new PrismaRefreshTokensRepository()

  async execute(input: { email: string, password: string, userAgent?: string | null, ip?: string | null }) {
    const { user } = await this.auth.execute({ email: input.email, password: input.password })

    const rawRefresh = crypto.randomBytes(48).toString('base64url')
    await this.refreshRepo.create({
      userId: user.id,
      tokenHash: sha256(rawRefresh),
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
      expiresAt: dayjs().add(env.REFRESH_EXPIRES_IN_DAYS, 'day').toDate()
    })

    return { user, rawRefresh }
  }
}