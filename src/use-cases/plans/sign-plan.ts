import { PlansRepository } from '../../repositories/interfaces/plans-repository.js'
import { SignatureKind, SignatureMethod } from '@prisma/client'

export class SignPlanUseCase {
  constructor(private plansRepo: PlansRepository) {}

  async execute(input: {
    planId: string
    signerId: string | null
    kind: SignatureKind
    method: SignatureMethod
    fullName: string
    cargo: string
    imageKey?: string | null
    contentHash: string
    originNote?: string | null
  }) {
    const signature = await this.plansRepo.addSignature(input)
    return { signature }
  }
}
