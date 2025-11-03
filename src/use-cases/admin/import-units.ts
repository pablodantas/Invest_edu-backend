import type { ImportsRepository } from '../../repositories/interfaces/imports-repository.js'
import * as XLSX from 'xlsx'

export class ImportUnitsUseCase {
  constructor(private repo: ImportsRepository) {}
  async execute(buffer: Buffer) {
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(ws)
    const payload = rows.map(r => ({
      name: String(r.nome || r.name || '').trim(),
      mecCode: r.mecCode ? String(r.mecCode) : null,
      municipio: r.municipio ? String(r.municipio) : null,
      nte: r.nte ? String(r.nte) : null
    }))
    const count = await this.repo.upsertUnits(payload)
    return { imported: count }
  }
}
