import { PrismaPlanFlowRepository } from '../../repositories/prisma/prisma-plan-flow-repository.js'

export class ReturnToDraftUseCase {
  private repo = new PrismaPlanFlowRepository()

  async execute({
    planId,
    userId,
    note,
    issues = []
  }: {
    planId: string
    userId?: string | null
    note?: string | null
    issues?: { itemId: string, field: string, message: string }[]
  }) {
    return this.repo.returnToDraft({ planId, userId, note, issues })
  }
}
