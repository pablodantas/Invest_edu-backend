import { ItemTipo, Plan, PlanItem, PlanStatus, Signature } from '@prisma/client'

export type ReturnIssueInput = { itemId?: string | null; field: string; message: string };

export type CreatePlanInput = {
  title: string
  description: string
  solution: string
  prazoInicio: string
  prazoFim: string
  qtdMatriculas: number
  municipio: string
  nte: string
  schoolUnitId: string
  creatorId: string
  courses: Array<{ name: string; studentsQuantity: number; modality: string }>
  items: Array<{ description: string; unidade: string; quantidade: number; valorUnitario: number; tipo: ItemTipo }>
}

export interface PlansRepository {
  create(data: CreatePlanInput): Promise<Plan>
  findById(id: string): Promise<Plan & { items: PlanItem[]; signatures: Signature[] }>
  list(filter?: { status?: PlanStatus; schoolUnitId?: string }): Promise<Plan[]>
  updateStatus(planId: string, to: PlanStatus, changedBy?: string, note?: string): Promise<void>
  saveItemsAndTotals(planId: string, items: CreatePlanInput['items']): Promise<Plan>
  setPayloadHash(planId: string, hash: string): Promise<void>
  addSignature(data: {
    planId: string
    signerId: string | null
    kind: any
    method: any
    fullName: string
    cargo: string
    imageKey?: string | null
    contentHash: string
    originNote?: string | null
  }): Promise<Signature>
  approve(planId: string, userId: string): Promise<Plan>
  reject(planId: string, userId: string, reason: string, issues?: ReturnIssueInput[]): Promise<Plan>
}
