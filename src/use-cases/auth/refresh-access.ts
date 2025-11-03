import type { RefreshTokensRepository } from '../../repositories/interfaces/refresh-tokens-repository.js'
import crypto from 'node:crypto'
import dayjs from 'dayjs'
import { env } from '../../env/index.js'
import { sha256 } from '../../utils/crypto.js'

export class RefreshAccessTokenUseCase {
  constructor(private refresh: RefreshTokensRepository) {}
  async execute(raw: string) {
    const token = await this.refresh.findValidByHash(sha256(raw))
    if (!token) return null
    await this.refresh.revokeById(token.id)
    const newRaw = crypto.randomBytes(48).toString('base64url')
    const tokenHash = sha256(newRaw)
    const expiresAt = dayjs().add(env.REFRESH_EXPIRES_IN_DAYS, 'day').toDate()
    await this.refresh.create({ userId: token.userId, tokenHash, userAgent: token.userAgent ?? null, ip: token.ip ?? null, expiresAt })
    return { userId: token.userId, role: token.user?.role ?? 'USER', newRaw, expiresAt }
  }
}
