import type { PlanFlowRepository } from '../../repositories/interfaces/plan-flow-repository.js'

export class LastRejectionUseCase {
  constructor(private repo: PlanFlowRepository) {}
  async execute(planId: string) {
    const rejection = await this.repo.getLastRejection(planId)
    return { rejection }
  }
}
