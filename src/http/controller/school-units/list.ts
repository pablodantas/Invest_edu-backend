import { FastifyReply, FastifyRequest } from "fastify";
import { ListUnitsUseCase } from "../../../use-cases/school-units/list-school-units.js";

export async function listUnits(req: FastifyRequest, reply: FastifyReply) {
  const { page = 1, perPage = 10, q, municipio, nte, escritorioCriativo, projetoAgroecologico, labRobotica, labInformatica } =
    (req.query as any) || {};
  const result = await new ListUnitsUseCase().execute({
    page: Number(page),
    perPage: Number(perPage),
    q: q as any,
    municipio: municipio as any,
    nte: nte as any,
    escritorioCriativo: escritorioCriativo as any,
    projetoAgroecologico: projetoAgroecologico as any,
    labRobotica: labRobotica as any,
    labInformatica: labInformatica as any,
  })
  return reply.send(result)
}