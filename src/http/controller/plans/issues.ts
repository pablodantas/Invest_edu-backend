import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaPlanFlowRepository } from '../../../repositories/prisma/prisma-plan-flow-repository.js'
import { ListPlanIssuesUseCase } from '../../../use-cases/plans/list-issues.js'

export async function listPlanIssues(req: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
  const issues = await new ListPlanIssuesUseCase(new PrismaPlanFlowRepository()).execute(id)
  return { issues: issues.issues ?? issues }
}