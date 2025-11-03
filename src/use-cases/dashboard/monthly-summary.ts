import { prisma } from '../../lib/prisma.js'
// Nota: Se quiser 100% sem Prisma aqui, criar DashboardRepository; mantive mínimo por performance.
// Opcional: extrair em repo conforme sua política.

export class MonthlySummaryUseCase {
  async execute({ year, month }: { year: number, month: number }) {
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end = new Date(Date.UTC(year, month, 1))
    const plans = await prisma.plan.findMany({
      where: { approvedAt: { gte: start, lt: end } },
      select: { totalCusteio: true, totalCapital: true, totalGeral: true }
    })
    const totalCusteio = plans.reduce((a, p) => a + Number(p.totalCusteio ?? 0), 0)
    const totalCapital = plans.reduce((a, p) => a + Number(p.totalCapital ?? 0), 0)
    const totalGeral = plans.reduce((a, p) => a + Number(p.totalGeral ?? 0), 0)
    const byStatus = await prisma.plan.groupBy({ by: ['status'], _count: { status: true } })
    return { totalGeral, totalCusteio, totalCapital, byStatus }
  }
}
