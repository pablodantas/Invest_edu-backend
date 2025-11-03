import { prisma } from '../../lib/prisma.js'

function n(v: any) { const x = Number(v); return Number.isFinite(x) ? x : 0 }

export async function unitBudgetSummaryV2(schoolUnitId: string) {
  // 1) saldos (initialAmount pode ou não incluir descentralizações concluídas)
  const budgets = await prisma.unitBudget.findMany({
    where: { schoolUnitId },
    select: { type: true, initialAmount: true },
  })
  const initC = n(budgets.find(b => b.type === 'CUSTEIO')?.initialAmount)
  const initK = n(budgets.find(b => b.type === 'CAPITAL')?.initialAmount)

  // 2) descentralizações (para decidir ajuste e exibir cartões)
  const dz = await prisma.decentralization.groupBy({
    by: ['type', 'status'],
    where: { schoolUnitId },
    _sum: { amount: true },
  })
  const dzCConcl = n(dz.find(d => d.type === 'CUSTEIO' && d.status === 'CONCLUIDA')?._sum.amount)
  const dzKConcl = n(dz.find(d => d.type === 'CAPITAL' && d.status === 'CONCLUIDA')?._sum.amount)
  const dzCPend  = n(dz.find(d => d.type === 'CUSTEIO' && d.status === 'PENDENTE')?._sum.amount)
  const dzKPend  = n(dz.find(d => d.type === 'CAPITAL' && d.status === 'PENDENTE')?._sum.amount)

  // 3) comprometido SOMENTE dos planos desta unidade (estados que reservam verba)
  const items = await prisma.planItem.findMany({
    where: {
      plan: {
        schoolUnitId,
        status: { in: ['EM_ANALISE','COLETA_ASSINATURA','EM_PROCESSO_DESCENTRALIZACAO','PLANO_CONCLUIDO'] },
      },
    },
    select: { tipo: true, quantidade: true, valorUnitario: true },
  })
  let commC = 0, commK = 0
  for (const it of items) {
    const val = n(it.valorUnitario) * n(it.quantidade ?? 1)
    if (it.tipo === 'CUSTEIO') commC += val
    else                       commK += val
  }

  // 4) Heurística contra dupla contagem:
  //    se initialAmount - descentralizadoConcluído < 0 => initial NÃO inclui crédito => ajustar somando
  const adjC = (initC - dzCConcl < 0) ? initC + dzCConcl : initC
  const adjK = (initK - dzKConcl < 0) ? initK + dzKConcl : initK

  // 5) disponível (sempre clamp >= 0)
  const dispC = Math.max(0, adjC - commC)
  const dispK = Math.max(0, adjK - commK)

  // 6) totais
  const saldoInicialTotal = adjC + adjK
  const comprometidoTotal = commC + commK
  const disponivelTotal   = Math.max(0, saldoInicialTotal - comprometidoTotal)

  return {
    custeio: {
      inicial: initC,
      inicialAjustado: adjC,
      comprometido: commC,
      disponivelAjustado: dispC,
      descentralizado: dzCConcl,
      pendenteDescentralizar: dzCPend,
    },
    capital: {
      inicial: initK,
      inicialAjustado: adjK,
      comprometido: commK,
      disponivelAjustado: dispK,
      descentralizado: dzKConcl,
      pendenteDescentralizar: dzKPend,
    },
    saldoInicialTotal,
    comprometidoTotal,
    disponivelTotal,
  }
}

// (Opcional) compatibilidade se seu controller importar classe
export class UnitBudgetSummaryV2UseCase {
  async execute(schoolUnitId: string) {
    return unitBudgetSummaryV2(schoolUnitId)
  }
}
