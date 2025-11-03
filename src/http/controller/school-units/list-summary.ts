import { FastifyReply, FastifyRequest } from "fastify";
import { SchoolUnitsSummaryUseCase } from "../../../use-cases/school-units/list-summary.js";

export async function schoolUnitsSummaryRoutes(req: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await new SchoolUnitsSummaryUseCase().execute()
    return reply.send(result)
  } catch (error) {
    console.error("Erro ao gerar resumo de unidades:", error);
    return reply.status(500).send({
      message: "Erro ao gerar resumo de unidades escolares.",
      error: String(error),
    });
  }
}