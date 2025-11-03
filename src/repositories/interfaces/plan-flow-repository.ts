export type ReturnIssueDTO = {
  id: string
  planId: string
  itemId: string | null
  field: string
  message: string
  createdAt: Date
  item?: {
    id: string
    descricao?: string | null
    tipo?: string | null
    quantidade?: number | null
    valorUnitario?: any
  } | null
}

export type RejectionDTO = {
  note: string | null
  by: { id: string, name: string } | null
  changedAt: Date
} | null

export interface PlanFlowRepository {
  /** Devolve o plano para rascunho, ajustando orçamentos e registrando histórico e marcações. */
  returnToDraft(params: {
    planId: string,
    userId?: string | null,
    note?: string | null,
    issues?: { itemId: string, field: string, message: string }[]
  }): Promise<{ id: string, status: string }>

  /** Lista issues de devolução, incluindo os dados do item marcado. */
  listIssues(planId: string): Promise<ReturnIssueDTO[]>

  /** Obtém a última rejeição (motivo, autor, data). */
  getLastRejection(planId: string): Promise<RejectionDTO>
}
