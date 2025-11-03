import type { BudgetsRepository } from '../../repositories/interfaces/budgets-repository.js'
export class PreviewApprovalUseCase {
  constructor(private budgets: BudgetsRepository) {}
  async execute(planId: string) {
    return this.budgets.previewAfterPlan(planId)
  }
}
