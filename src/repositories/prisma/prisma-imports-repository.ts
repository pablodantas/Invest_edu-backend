import { prisma } from '../../lib/prisma.js'
import type { ImportsRepository } from '../interfaces/imports-repository.js'

export class PrismaImportsRepository implements ImportsRepository {
  async upsertUnits(rows: Array<{ name: string, mecCode?: string|null, municipio?: string|null, nte?: string|null }>): Promise<number> {
    for (const r of rows) {
      await prisma.schoolUnit.upsert({
        where: { mecCode: r.mecCode || r.name },
        update: { name: r.name, municipio: r.municipio ?? null, nte: r.nte ?? null },
        create: { name: r.name, mecCode: r.mecCode ?? null, municipio: r.municipio ?? null, nte: r.nte ?? null }
      })
    }
    return rows.length
  }
  async upsertUsers(rows: Array<{ name: string, email: string, role: string, schoolUnitId?: string|null, passwordHash: string }>): Promise<number> {
    for (const u of rows) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: { name: u.name, role: u.role, schoolUnitId: u.schoolUnitId ?? null, passwordHash: u.passwordHash },
        create: { name: u.name, email: u.email, role: u.role, schoolUnitId: u.schoolUnitId ?? null, passwordHash: u.passwordHash }
      })
    }
    return rows.length
  }
}
