export interface SchoolUnitsRepository {
  count(): Promise<number>
  countImplantacoes(): Promise<{ escritorioCriativo: number, projetoAgroecologico: number, labRobotica: number, labInformatica: number }>
  listApprovedPlans(schoolUnitId: string): Promise<Array<{
    id: string, title: string, approvedAt: Date | null,
    items: Array<{ tipo: 'CUSTEIO'|'CAPITAL', quantidade: number, valorUnitario: number | string }>
  }>>

  getUnitBasic(schoolUnitId: string): Promise<{ id: string, name: string, mecCode: string | null, municipio: string | null, nte: string | null } | null>
}
