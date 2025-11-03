import { UsersRepository } from '../../repositories/interfaces/users-repository'
import bcrypt from 'bcrypt'
import { InvalidCredentialError } from './errors/invalid-credentials-error';

export class AuthenticateUseCase {
  constructor(private usersRepo: UsersRepository) { }

  async execute({ email, password }: { email: string; password: string }) {
    const user = await this.usersRepo.findByEmail(email)
    if (!user) throw new InvalidCredentialError()

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new InvalidCredentialError()

    return { user }
  }
}
