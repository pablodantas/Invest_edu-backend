import type { RefreshTokensRepository } from '../../repositories/interfaces/refresh-tokens-repository.js'
import { sha256 } from '../../utils/crypto.js'
export class LogoutUseCase {
  
  constructor(private refresh: RefreshTokensRepository) {}
  async execute(raw?: string | null) {
    if (!raw) return { revoked: 0 }
    const revoked = await this.refresh.revokeByHash(sha256(raw))
    return { revoked }
  }
}
