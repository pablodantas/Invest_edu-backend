import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { RegisterUseCase } from '../../../use-cases/auth/register.js'
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-repository.js'
import { UserAlreadyExistsError } from '../../../use-cases/auth/errors/user-already-exists-error.js'

export async function register(req: FastifyRequest, reply: FastifyReply) {
  try {
    const registerBodySchema = z.object({
      name: z.string().min(2),
      email: z.string().email().endsWith('@enova.educacao.ba.gov.br', { message: "O e-mail deve ser do domínio @enova.educacao.ba.gov.br" }),
      password: z.string().min(6),
      matricula: z.string().regex(/^\d+$/),
      funcao: z.enum(['PROFESSOR', 'COORDENADOR', 'DIRETOR', 'TESOUREIRO', 'PRESIDENTE_CAIXA', 'OUTRO']),
      role: z.enum(['ADMIN', 'GESTOR', 'SUPROT', 'DIRETOR_SUPROT']).default('GESTOR'),
      schoolUnitId: z.string().uuid().optional(),
    }).parse(req.body)


    const useCase = new RegisterUseCase(new PrismaUsersRepository())
    const { id } = await useCase.execute(registerBodySchema)
    return reply.status(201).send({ id })
  } catch (err) {

    if (err instanceof UserAlreadyExistsError) return reply.status(409).send({ messege: err.message })

    throw err
  }
}
