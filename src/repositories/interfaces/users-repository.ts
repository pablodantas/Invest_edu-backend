import { Role, Funcao, User } from '@prisma/client'

export interface CreateUserDTO {
  name: string; email: string; passwordHash: string;
  matricula: string; funcao: Funcao; role: Role;
  schoolUnitId?: string | null; profileImageKey?: string | null; signatureImageKey?: string | null;
}

export interface ExecuteUserDTO extends Omit<CreateUserDTO, 'passwordHash'> {
  password: string;
}

export interface UsersRepository {
  create(data: CreateUserDTO): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findByMatricula(matricula: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  updateProfileImage(userId: string, key: string): Promise<void>
  updateSignatureImage(userId: string, key: string): Promise<void>
}
