import { PrismaPlansRepository } from '../../repositories/prisma/prisma-plans-repository.js'
import { ReturnIssueInput } from '../../repositories/interfaces/plans-repository.js'

interface RejectPlanRequest {
  planId: string
  approverId: string
  reason: string
  issues?: ReturnIssueInput[]
}

export class RejectPlanUseCase {
  constructor(private repo = new PrismaPlansRepository()) {}
  async execute({ planId, approverId, reason, issues = [] }: RejectPlanRequest) {
    const plan = await this.repo.reject(planId, approverId, reason, issues)
    return { plan }
  }
}
