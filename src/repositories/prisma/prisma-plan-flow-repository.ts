import { prisma } from '../../lib/prisma.js'
import type { PlanFlowRepository, ReturnIssueDTO, RejectionDTO } from '../interfaces/plan-flow-repository.js'

export class PrismaPlanFlowRepository implements PlanFlowRepository {

  async returnToDraft({ planId, userId, note, issues = [] }: { planId: string, userId?: string | null, note?: string | null, issues?: { itemId: string, field: string, message: string }[] }) {
    const updated = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({ where: { id: planId } })
      if (!plan) throw new Error('Plano não encontrado')

      // Carrega itens para calcular totais por tipo
      const pWithItems = await tx.plan.findUnique({
        where: { id: planId },
        select: {
          schoolUnitId: true,
          items: { select: { tipo: true, quantidade: true, valorUnitario: true } }
        }
      })

      let totalCusteio = 0
      let totalCapital = 0
      for (const it of pWithItems?.items ?? []) {
        const q = Number(it.quantidade ?? 0)
        const v = Number(it.valorUnitario ?? 0)
        const tot = q * v
        if ((it.tipo ?? '').toUpperCase() === 'CAPITAL') totalCapital += tot
        else totalCusteio += tot
      }

      const unitId = (pWithItems as any)?.schoolUnitId as string | undefined
      const descomprometer = async (type: 'CUSTEIO' | 'CAPITAL', amount: number) => {
        if (!unitId || amount <= 0) return
        const key = { schoolUnitId_type: { schoolUnitId: unitId, type } }
        const current = await tx.unitBudget.findUnique({ where: key })
        const committed = Number(current?.committed ?? 0)
        const decrement = Math.min(committed, amount)
        await tx.unitBudget.upsert({
          where: key,
          update: { committed: Math.max(0, committed - decrement) },
          create: { schoolUnitId: unitId, type, initialAmount: 0, committed: 0 }
        })
      }
      await descomprometer('CUSTEIO', totalCusteio)
      await descomprometer('CAPITAL', totalCapital)

      // Atualiza status para PLANO_EM_CONSTRUCAO
      await tx.plan.update({
        where: { id: planId },
        data: { status: 'PLANO_EM_CONSTRUCAO' }
      })

      // Histórico
      await tx.planStatusHistory.create({
        data: {
          planId,
          from: plan.status,
          to: 'PLANO_EM_CONSTRUCAO',
          note: note ?? null,
          changedBy: userId ?? null,
          changedAt: new Date()
        }
      })

      // Registra issues da devolução (se houver)
      if (Array.isArray(issues) && issues.length) {
        await tx.planReturnIssue.createMany({
          data: issues
            .filter(i => i && i.itemId && i.field && i.message)
            .map(i => ({
              planId,
              itemId: i.itemId,
              field: i.field,
              message: i.message
            })),
          skipDuplicates: true
        })
      }

      return { id: planId, status: 'PLANO_EM_CONSTRUCAO' }
    })

    return updated
  }

  async listIssues(planId: string): Promise<ReturnIssueDTO[]> {
    const rows = await prisma.planReturnIssue.findMany({
      where: { planId },
      include: {
        item: {
          select: {
            id: true,
            description: true, // campo do Prisma
            tipo: true,
            quantidade: true,
            valorUnitario: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Compatibilidade: expor 'descricao' para o frontend que espera pt-BR
    return (rows as any).map((r: any) => ({
      ...r,
      item: r.item ? { ...r.item, descricao: r.item.description } : null
    })) as any
  }

  async getLastRejection(planId: string): Promise<RejectionDTO> {
    const hist = await prisma.planStatusHistory.findFirst({
      where: {
        planId,
        to: { in: ['PLANO_EM_CONSTRUCAO', 'REJEITADO'] },
        NOT: { note: null }
      },
      orderBy: { changedAt: 'desc' }
    })
    if (!hist) return null

    let by: RejectionDTO['by'] = null
    if (hist.changedBy) {
      try {
        const u = await prisma.user.findUnique({
          where: { id: hist.changedBy },
          select: { id: true, name: true }
        })
        if (u) by = u as any
      } catch {}
    }

    return { note: hist.note ?? null, by, changedAt: hist.changedAt }
  }
}
