import { prisma } from '../../lib/prisma.js'
import { UsersRepository, CreateUserDTO } from '../interfaces/users-repository.js'

export class PrismaUsersRepository implements UsersRepository {
  async create(data: CreateUserDTO) {
    return prisma.user.create({ data })
  }
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }
  async findByMatricula(matricula: string) {
    return prisma.user.findUnique({ where: { matricula } })
  }
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }
  async updateProfileImage(userId: string, key: string) {
    await prisma.user.update({ where: { id: userId }, data: { profileImageKey: key } })
  }
  async updateSignatureImage(userId: string, key: string) {
    await prisma.user.update({ where: { id: userId }, data: { signatureImageKey: key } })
  }
}
