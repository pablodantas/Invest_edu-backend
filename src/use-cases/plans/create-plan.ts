import { CreatePlanInput, PlansRepository } from '../../repositories/interfaces/plans-repository.js'

export class CreatePlanUseCase {
  constructor(private plansRepo: PlansRepository) { }

  async execute(input: CreatePlanInput) {
    const plan = await this.plansRepo.create(input)
    return { plan }
  }
}
