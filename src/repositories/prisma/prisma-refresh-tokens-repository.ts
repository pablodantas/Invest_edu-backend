import { prisma } from '../../lib/prisma.js'
import { RefreshTokensRepository, RefreshTokenRecord } from '../interfaces/refresh-tokens-repository.js'

export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  async create(data: { userId: string; tokenHash: string; userAgent?: string | null; ip?: string | null; expiresAt: Date }): Promise<RefreshTokenRecord> {
    return await prisma.refreshToken.create({ data })
  }
  async revokeById(id: string): Promise<void> {
    await prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } })
  }
  async revokeByHash(tokenHash: string): Promise<number> {
    const res = await prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } })
    return res.count
  }
  async findValidByHash(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { select: { id: true, role: true } } }
    }) as any
  }
}
