import { FastifyReply, FastifyRequest } from 'fastify'
import { ImportUnitsUseCase } from '../../../use-cases/admin/import-units.js'

export async function importUnits(req: FastifyRequest, reply: FastifyReply) {
  // @ts-ignore
  const mp = await req.file()
  if (!mp) return reply.status(400).send({ message: 'arquivo não enviado' })
  const buf = await mp.toBuffer()
  const result = await new ImportUnitsUseCase(/* repository injected internally */ {} as any).execute(buf)
  return reply.send({ ok: true, imported: result.imported })
}