import type { SchoolUnitsRepository } from '../../repositories/interfaces/school-units-repository.js'
export class UnitApprovedPlansUseCase {
  constructor(private units: SchoolUnitsRepository) {}
  async execute(id: string) {
    const rows = await this.units.listApprovedPlans(id)
    return rows.map(p => {
      const sum = (tipo: 'CUSTEIO'|'CAPITAL') => p.items.filter((i:any)=>i.tipo===tipo).reduce((s:number,i:any)=> s + Number(i.valorUnitario) * i.quantidade, 0)
      const custeio = sum('CUSTEIO'); const capital = sum('CAPITAL')
      return { id: p.id, title: p.title, approvedAt: p.approvedAt, totalCusteio: custeio, totalCapital: capital, total: custeio + capital }
    })
  }
}
