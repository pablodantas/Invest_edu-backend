import type { PlansRepository } from '../../repositories/interfaces/plans-repository.js'

export class ListApprovedPlansUseCase {
  constructor(private plans: PlansRepository) {}
  async execute() {
    const raw = await this.plans.listApproved()
    return raw.map((p:any)=>{
      const sum = (tipo: 'CUSTEIO'|'CAPITAL') => p.items.filter((i:any)=>i.tipo===tipo).reduce((s:number,i:any)=> s + Number(i.valorUnitario) * i.quantidade, 0)
      const custeio = sum('CUSTEIO'); const capital = sum('CAPITAL')
      return { id: p.id, title: p.title, unidade: p.schoolUnit?.name ?? '-', date: p.approvedAt ?? null, totalCusteio: custeio, totalCapital: capital, total: custeio + capital }
    })
  }
}
