import { PlansRepository } from '../../repositories/interfaces/plans-repository.js'
import { PlanStatus } from '@prisma/client'
import { sha256 } from '../../utils/crypto.js'

export class SubmitPlanUseCase {
  constructor(private plansRepo: PlansRepository) {}

  async execute({ planId, normalizedPayload, userId }: { planId: string; normalizedPayload: unknown; userId: string }) {
    const payloadHash = sha256(JSON.stringify(normalizedPayload))
    await this.plansRepo.setPayloadHash(planId, payloadHash)
    await this.plansRepo.updateStatus(planId, PlanStatus.EM_ANALISE, userId, 'Plano submetido para análise')
    return { payloadHash }
  }
}
