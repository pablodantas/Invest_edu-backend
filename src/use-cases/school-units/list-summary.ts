import { prisma } from '../../lib/prisma.js'

// Estados de plano que reservam orçamento
const RESERVA = ['EM_ANALISE','COLETA_ASSINATURA','EM_PROCESSO_DESCENTRALIZACAO','PLANO_CONCLUIDO'] as const
const n = (v:any) => Number.isFinite(Number(v)) ? Number(v) : 0

export class SchoolUnitsSummaryUseCase {
  async execute() {
    const totalUnidades = await prisma.schoolUnit.count()

    // Quantitativos (mantive sua regra atual: apenas "IMPLANTADO")
    const [escritorioCriativo, projetoAgroecologico, labRobotica, labInformatica] = await Promise.all([
      prisma.schoolUnit.count({ where: { escritorioCriativo: 'IMPLANTADO' } }),
      prisma.schoolUnit.count({ where: { projetoAgroecologico: 'IMPLANTADO' } }),
      prisma.schoolUnit.count({ where: { labRobotica: 'IMPLANTADO' } }),
      prisma.schoolUnit.count({ where: { labInformatica: 'IMPLANTADO' } }),
    ])

    // Budgets por unidade/tipo
    const budgets = await prisma.unitBudget.findMany({
      select: { schoolUnitId: true, type: true, initialAmount: true }
    })

    // Descentralizações CONCLUÍDAS por unidade/tipo
    const dz = await prisma.decentralization.groupBy({
      by: ['schoolUnitId','type','status'],
      where: { status: 'CONCLUIDA' },
      _sum: { amount: true }
    })

    // Itens comprometidos nos estados que reservam verba
    const items = await prisma.planItem.findMany({
      where: { plan: { status: { in: [...RESERVA] } } },
      select: { tipo: true, quantidade: true, valorUnitario: true, plan: { select: { schoolUnitId: true } } }
    })

    type Acc = Record<string, { initC:number, initK:number, dzC:number, dzK:number, commC:number, commK:number }>
    const acc: Acc = {}
    const up = (id:string) => (acc[id] ??= { initC:0, initK:0, dzC:0, dzK:0, commC:0, commK:0 })

    for (const b of budgets) {
      const a = up(b.schoolUnitId)
      if (b.type === 'CUSTEIO') a.initC += n(b.initialAmount)
      else                      a.initK += n(b.initialAmount)
    }

    for (const d of dz) {
      const a = up(d.schoolUnitId)
      const val = n(d._sum?.amount)
      if (d.type === 'CUSTEIO') a.dzC += val
      else                      a.dzK += val
    }

    for (const it of items) {
      const a = up(it.plan.schoolUnitId)
      const val = n(it.valorUnitario) * n(it.quantidade ?? 1)
      if (it.tipo === 'CUSTEIO') a.commC += val
      else                       a.commK += val
    }

    // MESMA heurística do detalhe, por unidade
    let saldoInicialTotal = 0
    let comprometidoTotal = 0

    for (const id of Object.keys(acc)) {
      const a = acc[id]
      const adjC = (a.initC - a.dzC < 0) ? a.initC + a.dzC : a.initC
      const adjK = (a.initK - a.dzK < 0) ? a.initK + a.dzK : a.initK
      saldoInicialTotal += adjC + adjK
      comprometidoTotal += a.commC + a.commK
    }

    const disponivelTotal = saldoInicialTotal - comprometidoTotal

    return {
      totalUnidades,
      financeiro: {
        saldoInicialTotal,
        comprometidoTotal,
        disponivelTotal,
      },
      implantacoes: { escritorioCriativo, projetoAgroecologico, labRobotica, labInformatica }
    }
  }
}
