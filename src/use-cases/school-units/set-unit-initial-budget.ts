import type {
  BudgetsRepository,
  SetInitialsInput,
} from '../../repositories/interfaces/budgets-repository.js'

export class SetUnitInitialBudgetUseCase {
  constructor(private budgetsRepo: BudgetsRepository) {}

  async execute(unitId: string, input: SetInitialsInput): Promise<void> {
    if (!unitId) throw new Error('unitId é obrigatório')
    const { custeioInicial, capitalInicial } = input

    if (!Number.isFinite(custeioInicial) || !Number.isFinite(capitalInicial)) {
      throw new Error('Valores inválidos')
    }
    if (custeioInicial < 0 || capitalInicial < 0) {
      throw new Error('Valores não podem ser negativos')
    }

    const round2 = (v: number) => Math.round(v * 100) / 100
    await this.budgetsRepo.setInitialBudget(unitId, {
      custeioInicial: round2(custeioInicial),
      capitalInicial: round2(capitalInicial),
    })
  }
}
