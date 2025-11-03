import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma.js'

export async function resourcesReleasedMetrics(req: FastifyRequest, reply: FastifyReply) {
  const { days } = z.object({ days: z.coerce.number().int().min(1).max(365).default(30) }).parse(req.query)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const decs = await prisma.decentralization.findMany({
    where: { status: 'CONCLUIDA', concludedAt: { gte: since } },
    orderBy: { concludedAt: 'desc' },
    include: { plan: true }
  })

  const perPlan = decs.map(d => ({
    planId: d.planId,
    title: d.plan?.title ?? '',
    amount: Number(d.amount),
    releasedAt: d.concludedAt
  }))

  const total = perPlan.reduce((acc, p) => acc + (p.amount || 0), 0)

  return reply.send({ perPlan, total })
}
