import type { ImportsRepository } from '../../repositories/interfaces/imports-repository.js'
import * as XLSX from 'xlsx'
import bcrypt from 'bcrypt'

export class ImportUsersUseCase {
  constructor(private repo: ImportsRepository) {}
  async execute(buffer: Buffer) {
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(ws)
    const payload = await Promise.all(rows.map(async r => ({
      name: String(r.nome || r.name || '').trim(),
      email: String(r.email || '').trim().toLowerCase(),
      role: String(r.role || r.perfil || 'GESTOR').trim(),
      schoolUnitId: r.schoolUnitId || null,
      passwordHash: await bcrypt.hash(String(r.senha || r.password || '123456'), 10)
    })))
    const count = await this.repo.upsertUsers(payload)
    return { imported: count }
  }
}
