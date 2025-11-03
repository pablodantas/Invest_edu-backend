import { prisma } from '../../lib/prisma.js'
import type {
  BudgetsRepository,
  BudgetType,
  SetInitialsInput,
  UnitBudgetSlice,
  UnitBudgetSummary,
  PreviewAfterPlan,
} from '../interfaces/budgets-repository.js'

const TYPES: BudgetType[] = ['CUSTEIO', 'CAPITAL']

export class PrismaBudgetsRepository implements BudgetsRepository {
  /** Normaliza um registro do banco em um slice numérico */
  private toSlice(b: { initialAmount?: any; committed?: any }): UnitBudgetSlice {
    const inicial = Number(b?.initialAmount ?? 0)
    const comprometido = Number(b?.committed ?? 0)
    const disponivel = inicial - comprometido
    return { inicial, comprometido, disponivel }
  }

  /** Garante que existam registros para CUSTEIO e CAPITAL (upsert “no-op” se já existir) */
  private async ensureBudgets(schoolUnitId: string) {
    const results = await Promise.all(
      TYPES.map((type) =>
        prisma.unitBudget.upsert({
          where: { schoolUnitId_type: { schoolUnitId, type } },
          update: {},
          create: { schoolUnitId, type, initialAmount: 0, committed: 0 },
        }),
      ),
    )
    return results
  }

  /** Resumo atual da unidade (somando total) */
  async getUnitBudgetSummary(schoolUnitId: string): Promise<UnitBudgetSummary> {
    const budgets = await this.ensureBudgets(schoolUnitId)

    const find = (type: BudgetType) => budgets.find((b) => b.type === type)!
    const custeio = this.toSlice(find('CUSTEIO'))
    const capital = this.toSlice(find('CAPITAL'))

    return {
      custeio,
      capital,
      total: {
        inicial: custeio.inicial + capital.inicial,
        comprometido: custeio.comprometido + capital.comprometido,
        disponivel: custeio.disponivel + capital.disponivel,
      },
    }
  }

  /** Somente os valores iniciais (para preencher seu formulário) */
  async getUnitInitials(schoolUnitId: string) {
    const [c, k] = await Promise.all([
      prisma.unitBudget.upsert({
        where: { schoolUnitId_type: { schoolUnitId, type: 'CUSTEIO' } },
        update: {},
        create: { schoolUnitId, type: 'CUSTEIO', initialAmount: 0, committed: 0 },
      }),
      prisma.unitBudget.upsert({
        where: { schoolUnitId_type: { schoolUnitId, type: 'CAPITAL' } },
        update: {},
        create: { schoolUnitId, type: 'CAPITAL', initialAmount: 0, committed: 0 },
      }),
    ])
    return { custeio: Number(c.initialAmount ?? 0), capital: Number(k.initialAmount ?? 0) }
  }

  /** Atualiza os valores iniciais (idempotente) */
  async setUnitInitials(schoolUnitId: string, data: SetInitialsInput): Promise<SetInitialsInput> {
    const round2 = (v: number) => Math.round(v * 100) / 100
    const custeioInicial = round2(data.custeioInicial)
    const capitalInicial = round2(data.capitalInicial)

    await prisma.$transaction([
      prisma.unitBudget.upsert({
        where: { schoolUnitId_type: { schoolUnitId, type: 'CUSTEIO' } },
        update: { initialAmount: custeioInicial },
        create: {
          schoolUnitId,
          type: 'CUSTEIO',
          initialAmount: custeioInicial,
          committed: 0,
        },
      }),
      prisma.unitBudget.upsert({
        where: { schoolUnitId_type: { schoolUnitId, type: 'CAPITAL' } },
        update: { initialAmount: capitalInicial },
        create: {
          schoolUnitId,
          type: 'CAPITAL',
          initialAmount: capitalInicial,
          committed: 0,
        },
      }),
    ])

    return { custeioInicial, capitalInicial }
  }

  /** Alias usado pelo use case SetUnitInitialBudgetUseCase */
  async setInitialBudget(schoolUnitId: string, data: SetInitialsInput): Promise<void> {
    await this.setUnitInitials(schoolUnitId, data)
  }

  /** Prévia do impacto de um plano (sem persistir) */
  async previewAfterPlan(planId: string): Promise<PreviewAfterPlan> {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { items: true },
    })
    if (!plan) throw new Error('Plano não encontrado')

    const sumBy = (tipo: BudgetType) =>
      (plan.items ?? [])
        .filter((i: any) => i?.tipo === tipo)
        .reduce((s: number, i: any) => {
          const unit = Number(i?.valorUnitario ?? 0)
          const qty = Number(i?.quantidade ?? 0)
          return s + unit * qty
        }, 0)

    const deltaC = sumBy('CUSTEIO')
    const deltaK = sumBy('CAPITAL')

    const budgets = await prisma.unitBudget.findMany({
      where: { schoolUnitId: plan.schoolUnitId },
    })
    const map: Record<string, any> = Object.fromEntries(budgets.map((b) => [b.type, b]))

    const build = (type: BudgetType, delta: number) => {
      const b = map[type] ?? { initialAmount: 0, committed: 0 }
      const slice = this.toSlice(b)
      const disponivelPos = slice.disponivel - delta
      return { ...slice, delta, disponivelPos }
    }

    return {
      unitId: plan.schoolUnitId,
      custeio: build('CUSTEIO', deltaC),
      capital: build('CAPITAL', deltaK),
      total: { delta: deltaC + deltaK },
    }
  }
}
