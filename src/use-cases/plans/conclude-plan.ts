import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'

export class ConcludePlanUseCase {
  async execute({ planId, actorId }: { planId: string, actorId: string }) {
    return prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: { id: planId },
        include: {
          items: true,
          signatures: { include: { signer: true } },
        },
      })
      if (!plan) throw new AppError('Plano não encontrado', 404, 'PLAN_NOT_FOUND')

      /* ===================== Regras de assinatura ===================== */
      const MIN_SIGS = 5 // alinhar com o frontend
      const totalSigs = plan.signatures.length

      if (totalSigs < MIN_SIGS) {
        throw new AppError(
          'Assinaturas insuficientes para concluir o plano',
          422,
          'SIGNATURES_MISSING',
          { totalSigs, minRequired: MIN_SIGS }
        )
      }

      /* ===================== Totais por tipo ===================== */
      const sumBy = (tipo: 'CUSTEIO' | 'CAPITAL') =>
        plan.items
          .filter((i: any) => (i.tipo || '').toUpperCase() === tipo)
          .reduce((s: number, i: any) => s + Number(i.valorUnitario) * Number(i.quantidade), 0)

      const useCusteio = sumBy('CUSTEIO')
      const useCapital = sumBy('CAPITAL')

      /* ===================== Orçamentos atuais ===================== */
      const budgets = await tx.unitBudget.findMany({
        where: { schoolUnitId: plan.schoolUnitId },
      })
      const bC = budgets.find((b: any) => (b.type || '').toUpperCase() === 'CUSTEIO')
      const bK = budgets.find((b: any) => (b.type || '').toUpperCase() === 'CAPITAL')

      const dispC = bC ? Number(bC.initialAmount) - Number(bC.committed) : 0
      const dispK = bK ? Number(bK.initialAmount) - Number(bK.committed) : 0

      /* ===================== Checa saldo suficiente (com epsilon) ===================== */
      const EPS = 0.01
      const faltaCraw = Math.max(0, useCusteio - dispC)
      const faltaKraw = Math.max(0, useCapital - dispK)
      const faltaC = faltaCraw > EPS ? faltaCraw : 0
      const faltaK = faltaKraw > EPS ? faltaKraw : 0

      if (faltaC > 0 || faltaK > 0) {
        // saldo ainda insuficiente — envia para processo de descentralização
        const nextStatus = 'EM_PROCESSO_DESCENTRALIZACAO'
        const updated = await tx.plan.update({
          where: { id: planId },
          data: { status: nextStatus },
        })
        await tx.planStatusHistory
          .create({
            data: {
              planId,
              from: plan.status,
              to: nextStatus,
              changedBy: actorId,
              note: 'Saldo insuficiente — iniciar descentralização',
            },
          })
          .catch(() => {})

        return {
          plan: updated,
          needsDecentralization: true,
          missing: {
            CUSTEIO: Number(faltaC.toFixed(2)),
            CAPITAL: Number(faltaK.toFixed(2)),
          },
        }
      }

      /* ===================== Há saldo: realiza o "commit" e conclui ===================== */
      if (useCusteio > 0 && bC) {
        await tx.unitBudget.update({
          where: {
            schoolUnitId_type: { schoolUnitId: plan.schoolUnitId, type: 'CUSTEIO' },
          },
          data: { committed: { increment: useCusteio } },
        })
      }
      if (useCapital > 0 && bK) {
        await tx.unitBudget.update({
          where: {
            schoolUnitId_type: { schoolUnitId: plan.schoolUnitId, type: 'CAPITAL' },
          },
          data: { committed: { increment: useCapital } },
        })
      }

      const finalStatus = 'PLANO_CONCLUIDO'
      const updated = await tx.plan.update({
        where: { id: planId },
        data: { status: finalStatus },
      })
      await tx.planStatusHistory
        .create({
          data: { planId, from: plan.status, to: finalStatus, changedBy: actorId, note: 'Plano concluído' },
        })
        .catch(() => {})

      return { plan: updated, needsDecentralization: false }
    })
  }
}
