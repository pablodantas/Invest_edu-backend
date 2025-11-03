import { FastifyReply, FastifyRequest } from 'fastify'
import { saveCompressedImage } from '../../../lib/storage.js'
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-repository.js'

export async function uploadAvatar(req: FastifyRequest, reply: FastifyReply) {
    const data = await req.file()
    if (!data) return reply.badRequest('Arquivo obrigatório')
    const buffer = await data.toBuffer()
    const { fileKey } = await saveCompressedImage({ buffer, mime: data.mimetype, folder: 'usuarios' })
    await new PrismaUsersRepository().updateProfileImage(req.user.sub, fileKey)
    return reply.send({ fileKey, url: `/uploads/${fileKey}` })
}
