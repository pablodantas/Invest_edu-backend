import { PrismaPlansRepository } from '../../repositories/prisma/prisma-plans-repository.js'

export class ListPlansUseCase {
  constructor(private repo = new PrismaPlansRepository()) {}
  async execute({ status, schoolUnitId }: { status?: any; schoolUnitId?: string }) {
    const plans = await this.repo.list({ status, schoolUnitId })
    return { plans }
  }
}
