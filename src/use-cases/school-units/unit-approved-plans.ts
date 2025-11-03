import { prisma } from '../../lib/prisma.js'

export class UnitApprovedPlansUseCase {
  async execute(schoolUnitId: string) {
    const plans = await prisma.plan.findMany({
      where: { schoolUnitId, status: 'APROVADO' },
      orderBy: { approvedAt: 'desc' },
      select: {
        id: true, title: true, approvedAt: true,
        items: { select: { tipo: true, quantidade: true, valorUnitario: true } }
      }
    })
    const result = plans.map(p => {
      const sumBy = (tipo: 'CUSTEIO'|'CAPITAL') =>
        p.items.filter(i => i.tipo === tipo).reduce((s,i)=> s + Number(i.valorUnitario) * i.quantidade, 0)
      const custeio = sumBy('CUSTEIO')
      const capital = sumBy('CAPITAL')
      return { id: p.id, title: p.title, aprovadoEm: p.approvedAt, custeio, capital, total: custeio + capital }
    })
    return result
  }
}
