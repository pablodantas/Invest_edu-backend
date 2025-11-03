import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma.js'

export async function completedPlansMetrics(req: FastifyRequest, reply: FastifyReply) {
  const { days } = z.object({ days: z.coerce.number().int().min(1).max(365).default(30) }).parse(req.query)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const hist = await prisma.planStatusHistory.findMany({
    where: { to: 'PLANO_CONCLUIDO', changedAt: { gte: since } },
    orderBy: { changedAt: 'desc' },
    include: { plan: true }
  })

  const usersMap = new Map<string, any>()
  const byUserIds = Array.from(new Set(hist.map(h => h.changedBy).filter(Boolean))) as string[]
  if (byUserIds.length) {
    const users = await prisma.user.findMany({ where: { id: { in: byUserIds } } })
    users.forEach(u => usersMap.set(u.id, { id: u.id, name: u.name }))
  }

  const result = hist.map(h => ({
    id: h.planId,
    title: h.plan?.title ?? '',
    concludedAt: h.changedAt,
    by: h.changedBy ? (usersMap.get(h.changedBy) || { id: h.changedBy, name: 'Usuário' }) : null
  }))

  return reply.send(result)
}
