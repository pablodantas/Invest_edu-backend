import { FastifyReply, FastifyRequest } from 'fastify'
import { ImportUsersUseCase } from '../../../use-cases/admin/import-users.js'

export async function importUsers(req: FastifyRequest, reply: FastifyReply) {
    const mp = await req.file()
    if (!mp) return reply.status(400).send({ message: 'arquivo não enviado' })
    const buf = await mp.toBuffer()
    const result = await new ImportUsersUseCase(/* repository injected internally */ {} as any).execute(buf)
    return reply.send({ ok: true, imported: result.imported })
}