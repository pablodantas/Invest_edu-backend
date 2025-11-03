import { FastifyReply, FastifyRequest } from 'fastify'
import { saveCompressedImage } from '../../../lib/storage.js'
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-repository.js'

export async function uploadSignature(req: FastifyRequest, reply: FastifyReply) {
    const data = await req.file()
    if (!data) return reply.badRequest('Arquivo obrigatório (.png ou .jpg)')
    const buffer = await data.toBuffer()
    const { fileKey } = await saveCompressedImage({ buffer, mime: data.mimetype, folder: 'assinaturas' })
    await new PrismaUsersRepository().updateSignatureImage(req.user.sub, fileKey)
    return reply.send({ fileKey, url: `/uploads/${fileKey}` })
}
