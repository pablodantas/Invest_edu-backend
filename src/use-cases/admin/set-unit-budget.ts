import type { BudgetsRepository } from '../../repositories/interfaces/budgets-repository.js'
export class AdminSetUnitBudgetUseCase {
  constructor(private budgets: BudgetsRepository) {}
  async execute(unitId: string, data: { custeioInicial: number, capitalInicial: number }) {
    return this.budgets.setUnitInitials(unitId, data)
  }
}
