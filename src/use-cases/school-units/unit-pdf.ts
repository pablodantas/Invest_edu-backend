import type { SchoolUnitsRepository } from '../../repositories/interfaces/school-units-repository.js'
import type { BudgetsRepository } from '../../repositories/interfaces/budgets-repository.js'
import path from 'node:path'
import { env } from '../../env/index.js'
import { buildUnitPdf } from '../../utils/pdf-helpers.js'

export class UnitBudgetPdfUseCase {
  constructor(private units: SchoolUnitsRepository, private budgets: BudgetsRepository) {}
  async execute(schoolUnitId: string) {
    const unit = await this.units.getUnitBasic(schoolUnitId)
    if (!unit) return { notFound: true }
    const summary = await this.budgets.getUnitBudgetSummary(schoolUnitId)
    const approved = [] as Array<{ id: string, title: string, approvedAt: Date | null, totalGeral: number }>
    const file = path.resolve(env.UPLOAD_DIR, `unit-${schoolUnitId}.pdf`)
    await buildUnitPdf({
      outputPath: file,
      unit: { name: unit.name, inep: unit.mecCode ?? '', municipio: unit.municipio ?? '', nte: unit.nte ?? '' },
      budget: {
        custeio: { inicial: summary.custeio.inicial, comprometido: summary.custeio.comprometido },
        capital: { inicial: summary.capital.inicial, comprometido: summary.capital.comprometido }
      },
      plans: approved
    })
    return { fileName: `unit-${schoolUnitId}.pdf` }
  }
}
