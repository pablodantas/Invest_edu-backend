import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { verifyJWT } from '../../middlewares/verify-jwt.js'
import path from 'node:path'
import { PrismaPlansRepository } from '../../../repositories/prisma/prisma-plans-repository.js'
import { buildPlanPdf } from '../../../utils/pdf-helpers.js'
import dayjs from 'dayjs'
import { env } from '../../../env/index.js'

export async function planPdf(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const plan = await new PrismaPlansRepository().findById(id)

  const file = path.resolve(env.UPLOAD_DIR, `plan-${id}.pdf`)
  buildPlanPdf({
    outputPath: file,
    header: { titulo: plan.title },
    info: {
      'Unidade Escolar': plan.schoolUnit.name,
      'Código MEC': plan.schoolUnit.mecCode,
      'Município / NTE': `${plan.municipio} / ${plan.nte}`,
      'Status': plan.status,
      'Criado em': dayjs(plan.createdAt).format('DD/MM/YYYY HH:mm'),
      'Enviado em': plan.submittedAt ? dayjs(plan.submittedAt).format('DD/MM/YYYY HH:mm') : '-',
      'Hash do Plano': plan.payloadHash ?? '-',
      'Total Custeio': `R$ ${Number(plan.totalCusteio).toFixed(2)}`,
      'Total Capital': `R$ ${Number(plan.totalCapital).toFixed(2)}`,
      'Total Geral': `R$ ${Number(plan.totalGeral).toFixed(2)}`,
    },
    items: plan.items.map(i => ({
      descricao: i.description,
      unidade: i.unidade,
      qtd: i.quantidade,
      unit: `R$ ${Number(i.valorUnitario).toFixed(2)}`,
      total: `R$ ${(Number(i.valorUnitario) * i.quantidade).toFixed(2)}`,
      tipo: i.tipo
    })),
    signatures: plan.signatures.map(s => ({
      imagePath: s.imageKey ? path.resolve(env.UPLOAD_DIR, s.imageKey) : undefined,
      nome: s.fullName,
      cargo: s.cargo,
      dataHora: dayjs(s.signedAt).format('DD/MM/YYYY HH:mm'),
      origem: s.originNote ?? undefined,
    }))
  })
  return reply.sendFile(`plan-${id}.pdf`)
}
