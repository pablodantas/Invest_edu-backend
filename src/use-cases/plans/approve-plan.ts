import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'

interface ApprovePlanRequest {
  planId: string
  approverId: string
}

export class ApprovePlanUseCase {
  async execute({ planId, approverId }: ApprovePlanRequest) {
    return prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: { id: planId }
      })
      if (!plan) throw new AppError('Plano não encontrado', 404, 'PLAN_NOT_FOUND')

      // Nova regra: aprovação envia para COLETA_ASSINATURA (não compromete orçamento aqui)
      const updated = await tx.plan.update({
        where: { id: planId },
        data: { status: 'COLETA_ASSINATURA', approvedAt: new Date() }
      })

      await tx.planStatusHistory.create({
        data: { planId, from: plan.status, to: 'COLETA_ASSINATURA', changedBy: approverId, note: 'Plano aprovado para coleta de assinatura' }
      }).catch(() => {})

      return { plan: updated }
    })
  }
}
