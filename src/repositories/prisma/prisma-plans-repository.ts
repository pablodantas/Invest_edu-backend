import { prisma } from '../../lib/prisma.js'
import { PlansRepository, CreatePlanInput } from '../interfaces/plans-repository.js'
import { Decimal } from '@prisma/client/runtime/library.js'
import { PlanStatus } from '@prisma/client'
import { AppError } from '../../errors/AppError.js'

export class PrismaPlansRepository implements PlansRepository {
  async create(data: CreatePlanInput) {
    const plan = await prisma.plan.create({
      data: {
        title: data.title,
        description: data.description,
        solution: data.solution,
        prazoInicio: data.prazoInicio,
        prazoFim: data.prazoFim,
        qtdMatriculas: data.qtdMatriculas,
        municipio: data.municipio,
        nte: data.nte,
        schoolUnitId: data.schoolUnitId,
        creatorId: data.creatorId,
        items: {
          create: data.items.map(i => ({
            description: i.description,
            unidade: i.unidade,
            quantidade: i.quantidade,
            valorUnitario: new Decimal(i.valorUnitario),
            tipo: i.tipo,
          })),
        },
        courses: {
          create: data.courses.map(i => ({
            name: i.name,
            studentsQuantity: i.studentsQuantity,
            modality: i.modality,
          })),
        },
      },
    })
    await this.recalculateTotals(plan.id)
    return plan
  }

  async findById(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {items: true, signatures: true, courses: true, schoolUnit: true, creator: true  },
    })
    if (!plan) throw new Error('Plano não encontrado')
    return plan as any
  }

  async list(filter?: { status?: any; schoolUnitId?: string }) {
    return prisma.plan.findMany({
      where: {
        status: filter?.status,
        schoolUnitId: filter?.schoolUnitId,
      },
       include: { items: true, signatures: true, courses: true, schoolUnit: true, creator: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateStatus(planId: string, to: PlanStatus, changedBy?: string, note?: string) {
    const current = await prisma.plan.findUnique({ where: { id: planId } })
    if (!current) throw new Error('Plano não encontrado')

    const now = new Date()
    const data: any = { status: to }
    if (to === 'EM_ANALISE' && !current.submittedAt) data.submittedAt = now
    if (to === 'APROVADO') data.approvedAt = now
    if (to === 'REJEITADO') data.rejectedAt = now

    await prisma.plan.update({ where: { id: planId }, data })
    await prisma.planStatusHistory.create({
      data: { planId, from: current.status, to, changedBy: changedBy ?? null, note: note ?? null },
    })
  }

  async saveItemsAndTotals(planId: string, items: CreatePlanInput['items']) {
    await prisma.planItem.deleteMany({ where: { planId } })
    await prisma.planItem.createMany({
      data: items.map(i => ({
        planId,
        description: i.description,
        unidade: i.unidade,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
        tipo: i.tipo,
      })),
    })
    await this.recalculateTotals(planId)
    return prisma.plan.findUnique({ where: { id: planId } }) as any
  }

  async setPayloadHash(planId: string, hash: string) {
    await prisma.plan.update({ where: { id: planId }, data: { payloadHash: hash } })
  }

  async recalculateTotals(planId: string) {
    const items = await prisma.planItem.findMany({ where: { planId } })
    const sum = (filtro: 'CUSTEIO' | 'CAPITAL') =>
      items
        .filter(i => i.tipo === filtro)
        .reduce((acc, i) => acc + Number(i.valorUnitario) * i.quantidade, 0)

    const totalCusteio = sum('CUSTEIO')
    const totalCapital = sum('CAPITAL')
    const totalGeral = totalCusteio + totalCapital

    await prisma.plan.update({
      where: { id: planId },
      data: {
        totalCusteio,
        totalCapital,
        totalGeral,
      },
    })
  }

  async addSignature(data: any) {
    // Bloqueio de duplicidade por tipo de assinatura (kind)
    const existing = await prisma.signature.findFirst({ where: { planId: data.planId, kind: data.kind as any } })
    if (existing) {
      throw new AppError('Assinatura deste tipo já coletada para o plano.', 409, 'DUPLICATE_SIGNATURE_KIND')
    }
    return prisma.signature.create({ data })
  }
  
  async approve(planId: string, userId: string) {
    const plan = await prisma.plan.update({
      where: { id: planId },
      data: { status: 'APROVADO', approvedAt: new Date() },
    })
    try {
      await prisma.planStatusHistory.create({
        data: { planId, from: plan.status, to: 'APROVADO', changedBy: userId, note: 'Aprovação via endpoint' }
      })
    } catch { }
    return plan
  }

  async reject(planId: string, userId: string, reason: string, issues: any[] = []) {
    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.plan.update({
        where: { id: planId },
        data: { status: 'REJEITADO' },
      })
      try {
        await tx.planStatusHistory.create({
          data: { planId, from: up.status, to: 'REJEITADO', changedBy: userId, note: reason || 'Sem motivo informado' }
        })
      } catch {}
      if (issues.length) {
        await tx.planReturnIssue.createMany({
          data: issues.map(i => ({
            planId,
            itemId: i.itemId ?? null,
            field: i.field,
            message: i.message,
          })),
        })
      }
      return up
    })
    return updated
  }

}

