export interface RefreshTokenRecord {
  id: string
  userId: string
  tokenHash: string
  userAgent?: string | null
  ip?: string | null
  createdAt: Date
  expiresAt: Date
  revokedAt: Date | null
  user?: { id: string, role: string } | null
}

export interface RefreshTokensRepository {
  create(data: { userId: string, tokenHash: string, userAgent?: string | null, ip?: string | null, expiresAt: Date }): Promise<RefreshTokenRecord>
  revokeById(id: string): Promise<void>
  revokeByHash(tokenHash: string): Promise<number>
  findValidByHash(tokenHash: string): Promise<RefreshTokenRecord | null>
}
