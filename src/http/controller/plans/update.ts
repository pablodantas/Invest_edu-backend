import { FastifyReply, FastifyRequest } from 'fastify'
import { UpdatePlanUseCase } from "../../../use-cases/plans/update-plan";

export async function updatePlan(req: FastifyRequest, reply: FastifyReply) {
  const planId = (req.params as any)?.id;
  const data = req.body as any;

  const useCase = new UpdatePlanUseCase();
  const result = await useCase.execute({ planId, data });

  return reply.send(result);
}
