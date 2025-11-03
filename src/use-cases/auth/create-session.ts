import type { RefreshTokensRepository } from '../../repositories/interfaces/refresh-tokens-repository.js'
import crypto from 'node:crypto'
import dayjs from 'dayjs'
import { sha256 } from '../../utils/crypto.js'
import { env } from '../../env/index.js'

export class CreateSessionUseCase {
  constructor(private refresh: RefreshTokensRepository) {}
  async execute({ userId, userAgent, ip }: { userId: string, userAgent?: string | null, ip?: string | null }) {
    const raw = crypto.randomBytes(48).toString('base64url')
    const tokenHash = sha256(raw)
    const expiresAt = dayjs().add(env.REFRESH_EXPIRES_IN_DAYS, 'day').toDate()
    await this.refresh.create({ userId, tokenHash, userAgent: userAgent ?? null, ip: ip ?? null, expiresAt })
    return { raw, expiresAt }
  }
}
