import { prisma } from '../../lib/prisma.js';

export class GetMeUseCase {
  async execute(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, funcao: true, profileImageKey: true, signatureImageKey: true,
                schoolUnit: { select: { id: true, name: true, mecCode: true, municipio: true, nte: true } } }
    })
    return { user }
  }
}
