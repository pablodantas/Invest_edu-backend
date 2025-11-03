import type { BudgetsRepository } from '../../repositories/interfaces/budgets-repository.js'
export class UnitBudgetSummaryUseCase {
  constructor(private budgets: BudgetsRepository) {}
  async execute(id: string) { return this.budgets.getUnitBudgetSummary(id) }
}
