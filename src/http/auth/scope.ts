import { Role } from '@prisma/client';

type Scope = { where?: any };

export function scopeByRole(user: { role: Role; schoolUnitId?: string | null }, field = 'schoolUnitId'): Scope {
  if (!user) return {};
  if (user.role === 'ADMIN' || user.role === 'DIRETOR_SUPROT' || user.role === 'SUPROT') return {};
  if (user.role === 'GESTOR' && user.schoolUnitId) {
    return { where: { [field]: user.schoolUnitId } };
  }
  return { where: { [field]: '__NO_ACCESS__' } };
}
