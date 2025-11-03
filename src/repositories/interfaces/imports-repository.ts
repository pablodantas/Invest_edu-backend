export interface ImportsRepository {
  upsertUnits(rows: Array<{ name: string, mecCode?: string|null, municipio?: string|null, nte?: string|null }>): Promise<number>
  upsertUsers(rows: Array<{ name: string, email: string, role: string, schoolUnitId?: string|null, passwordHash: string }>): Promise<number>
}
