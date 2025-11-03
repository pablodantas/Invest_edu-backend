import { PrismaBudgetsRepository } from '../../repositories/prisma/prisma-budgets-repository.js'

export class SetUnitInitialsUseCase {
  private budgets = new PrismaBudgetsRepository()
  async execute(schoolUnitId: string, data: { custeioInicial: number, capitalInicial: number }) {
    await this.budgets.setUnitInitials(schoolUnitId, data)
    return { ok: true }
  }
}