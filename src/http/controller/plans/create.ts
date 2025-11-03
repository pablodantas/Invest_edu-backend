import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { CreatePlanUseCase } from '../../../use-cases/plans/create-plan.js'
import { PrismaPlansRepository } from '../../../repositories/prisma/prisma-plans-repository.js'
import { UserAlreadyExistsError } from '../../../use-cases/auth/errors/user-already-exists-error.js'

export async function createPlan(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = z.object({
      title: z.string().min(3, { message: 'O titulo precisa conter no minimo' }),
      description: z.string().min(10, { message: 'A descrição precisa conter no mínimo 10 caracteres.' }),
      solution: z.string().min(10, { message: 'A descrição precisa conter no mínimo 10 caracteres.' }),
      qtdMatriculas: z.number().int().positive({ message: 'A quantidade de matrículas deve ser maior que zero.' }),
      municipio: z.string({ message: 'O campo município é obrigatório.' }),
      nte: z.string({ message: 'O campo NTE é obrigatório.' }),
      schoolUnitId: z.string().uuid({ message: 'O ID da unidade escolar não é um UUID válido.' }),
      prazoInicio: z.string().regex(/^\d{4}-\d{2}$/, {
        message: "O prazo de início deve estar no formato AAAA-MM.",
      }),
      prazoFim: z.string().regex(/^\d{4}-\d{2}$/, {
        message: "O prazo de fim deve estar no formato AAAA-MM.",
      }),
      courses: z.array(z.object({
        name: z.string().min(5),
        studentsQuantity: z.number().int().positive({ message: 'A quantidade de matrículas deve ser maior que zero.' }),
        modality: z.string().min(3, { message: 'A modalidade do curso é obrigatória.' })
      })),
      items: z.array(z.object({
        description: z.string().min(5, { message: 'O nome do curso deve ter no mínimo 5 caracteres.' }),
        unidade: z.string().min(2, { message: 'A unidade do item deve ter no mínimo 2 caracteres.' }),
        quantidade: z.number().int().positive({ message: 'A quantidade do item deve ser maior que zero.' }),
        valorUnitario: z.number().positive({ message: 'O valor unitário do item deve ser maior que zero.' }),
        tipo: z.enum(['CUSTEIO', 'CAPITAL']),
      })).min(1),
    }).parse(req.body)

    const { plan } = await new CreatePlanUseCase(new PrismaPlansRepository()).execute({
      ...body,
      creatorId: req.user.sub,
    })
    return reply.status(201).send({ id: plan.id })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) return reply.status(409).send({ messege: err.message })

    throw err
  }

}
