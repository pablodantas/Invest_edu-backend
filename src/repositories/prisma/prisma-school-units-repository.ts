import { prisma } from '../../lib/prisma.js'
import type { SchoolUnitsRepository } from '../interfaces/school-units-repository.js'

export class PrismaSchoolUnitsRepository implements SchoolUnitsRepository {
  async count() { return prisma.schoolUnit.count() }
  async countImplantacoes() {
    const [escritorioCriativo, projetoAgroecologico, labRobotica, labInformatica] = await Promise.all([
      prisma.schoolUnit.count({ where: { escritorioCriativo: 'IMPLANTADO' } }),
      prisma.schoolUnit.count({ where: { projetoAgroecologico: 'IMPLANTADO' } }),
      prisma.schoolUnit.count({ where: { labRobotica: 'IMPLANTADO' } }),
      prisma.schoolUnit.count({ where: { labInformatica: 'IMPLANTADO' } }),
    ])
    return { escritorioCriativo, projetoAgroecologico, labRobotica, labInformatica }
  }
  async listApprovedPlans(schoolUnitId: string) {
    return prisma.plan.findMany({
      where: { schoolUnitId, status: 'APROVADO' },
      orderBy: { approvedAt: 'desc' },
      select: { id: true, title: true, approvedAt: true, items: { select: { tipo: true, quantidade: true, valorUnitario: true } } }
    }) as any
  }
  async getUnitBasic(schoolUnitId: string) {
    return prisma.schoolUnit.findUnique({ where: { id: schoolUnitId }, select: { id: true, name: true, mecCode: true, municipio: true, nte: true } }) as any
  }
}
