import { PrismaPlansRepository } from '../../repositories/prisma/prisma-plans-repository.js'
import { SignPlanUseCase } from './sign-plan.js'
import dayjs from 'dayjs'

export class SignHandlerUseCase {
  private plans = new PrismaPlansRepository()
  private signer = new SignPlanUseCase(this.plans)

  /**
   * Envolve a assinatura do plano e retorna payload esperado pelo controller antigo.
   * Qualquer lógica adicional que dependia de Prisma no controller foi movida para cá.
   */
  async execute(input: {
    planId: string
    signerId: string | null
    kind: any
    method: any
    fullName: string
    cargo: string
    imageKey?: string | null
    contentHash: string
    originNote?: string | null
  }) {
    const { signature } = await this.signer.execute(input)
    return { signatureId: signature.id, signedAt: dayjs(signature.signedAt).toISOString() }
  }
}