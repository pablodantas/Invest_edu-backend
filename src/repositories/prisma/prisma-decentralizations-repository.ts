import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'

export type BudgetType = 'CUSTEIO' | 'CAPITAL'

export class PrismaDecentralizationsRepository {
  async create(input: { schoolUnitId: string; planId?: string | null; type: BudgetType; amount: number }) {
    // Regra anti-duplicidade por plano: bloquear se já existir PENDENTE para o mesmo planId
    if (input.planId) {
      const existing = await prisma.decentralization.findFirst({ where: { planId: input.planId, status: 'PENDENTE' as any } })
      if (existing) {
        throw new AppError('Já existe descentralização pendente para este plano.', 409, 'DUPLICATE_PENDING_FOR_PLAN')
      }
    }
    return prisma.decentralization.create({
      data: {
        schoolUnitId: input.schoolUnitId,
        planId: input.planId ?? null,
        type: input.type as any,
        amount: input.amount,
        status: 'PENDENTE',
      },
    })
  }

  async conclude(id: string) {
    const row = await prisma.decentralization.update({
      where: { id },
      data: { status: 'CONCLUIDA', concludedAt: new Date() },
    })
    // Soma ao saldo inicial do recurso correspondente
    await prisma.unitBudget.update({
      where: { schoolUnitId_type: { schoolUnitId: row.schoolUnitId, type: row.type as any } },
      data: { initialAmount: { increment: row.amount as any } },
    })
    return row
  }

  async sumByUnit(unitId: string) {
    const group = await prisma.decentralization.groupBy({
      by: ['type', 'status'],
      where: { schoolUnitId: unitId },
      _sum: { amount: true },
    })
    const get = (type: BudgetType, status: 'PENDENTE' | 'CONCLUIDA') =>
      Number(group.find((g: any) => g.type === type && g.status === status)?._sum.amount ?? 0)
    return {
      pendente: { CUSTEIO: get('CUSTEIO', 'PENDENTE'), CAPITAL: get('CAPITAL', 'PENDENTE') },
      concluida: { CUSTEIO: get('CUSTEIO', 'CONCLUIDA'), CAPITAL: get('CAPITAL', 'CONCLUIDA') },
    }
  }

  async list(params: { schoolUnitId: string; status?: 'PENDENTE' | 'CONCLUIDA' }) {
    return prisma.decentralization.findMany({
      where: {
        schoolUnitId: params.schoolUnitId,
        status: (params.status as any) || undefined,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
