import { PrismaRefreshTokensRepository } from '../../repositories/prisma/prisma-refresh-tokens-repository.js'
import { sha256 } from '../../utils/crypto.js'
import crypto from 'node:crypto'
import dayjs from 'dayjs'
import { env } from '../../env/index.js'

export class RefreshSessionUseCase {
  private repo = new PrismaRefreshTokensRepository()

  async execute(rawToken?: string | null) {
    if (!rawToken) return { ok: false as const, reason: 'MISSING' }

    const token = await this.repo.findValidByHash(sha256(rawToken))
    if (!token || !token.user) return { ok: false as const, reason: 'INVALID' }

    // revoke current and issue a new refresh token
    await this.repo.revokeById(token.id)
    const newRaw = crypto.randomBytes(48).toString('base64url')
    await this.repo.create({
      userId: token.userId,
      tokenHash: sha256(newRaw),
      userAgent: null,
      ip: null,
      expiresAt: dayjs().add(env.REFRESH_EXPIRES_IN_DAYS, 'day').toDate()
    })

    return { ok: true as const, userId: token.userId, role: token.user.role, newRaw }
  }
}