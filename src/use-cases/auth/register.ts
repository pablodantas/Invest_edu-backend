import { ExecuteUserDTO, UsersRepository } from '../../repositories/interfaces/users-repository.js'
import bcrypt from 'bcrypt'
import { UserAlreadyExistsError } from './errors/user-already-exists-error.js'

export class RegisterUseCase {
  constructor(private usersRepo: UsersRepository) { }

  async execute(input: ExecuteUserDTO) {
    const existsEmail = await this.usersRepo.findByEmail(input.email)
    if (existsEmail) throw new UserAlreadyExistsError()

    const existsMatricula = await this.usersRepo.findByMatricula(input.matricula)
    if (existsMatricula) throw new UserAlreadyExistsError()

    const passwordHash = await bcrypt.hash(input.password, 10)
    try {
      const user = await this.usersRepo.create({
        name: input.name,
        email: input.email,
        passwordHash,
        matricula: input.matricula,
        funcao: input.funcao,
        role: input.role,
        schoolUnitId: input.schoolUnitId ?? null,

      })
      return { id: user.id }

    } catch (err) {
      throw new Error('Error na criação do usuário')
    }

  }
}
