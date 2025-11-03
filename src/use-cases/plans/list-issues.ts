import type { PlanFlowRepository } from '../../repositories/interfaces/plan-flow-repository.js'

export class ListPlanIssuesUseCase {
  constructor(private repo: PlanFlowRepository) {}
  async execute(planId: string) {
    const issues = await this.repo.listIssues(planId)
    return { issues }
  }
}
