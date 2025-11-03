// src/use-cases/plans/update-plan.ts
import { prisma } from "../../lib/prisma";

type UpdatePlanInput = {
  planId: string;
  data: {
    title?: string;
    description?: string;
    solution?: string;
    prazoInicio?: string;
    prazoFim?: string;
    municipio?: string;
    nte?: string;
    qtdMatriculas?: number;
    items?: Array<{
      id?: string;
      description: string;
      unidade?: string;
      quantidade: number;
      valorUnitario: number;
      tipo: "CUSTEIO" | "CAPITAL" | string;
    }>;
    courses?: Array<{
      id?: string;
      name: string;
      modality?: string;
      studentsQuantity: number;
    }>;
    // <<< NOVO
    resolveIssuesForItemIds?: string[];
  };
};

export class UpdatePlanUseCase {
  async execute({ planId, data }: UpdatePlanInput) {
    // garante id válido
    if (!planId) throw new Error("PlanId obrigatório");

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plano não encontrado");

    // monta payload básico
    const payload: any = {};
    if (typeof data.title !== "undefined") payload.title = data.title;
    if (typeof data.description !== "undefined") payload.description = data.description;
    if (typeof data.solution !== "undefined") payload.solution = data.solution;
    if (typeof data.prazoInicio !== "undefined") payload.prazoInicio = data.prazoInicio;
    if (typeof data.prazoFim !== "undefined") payload.prazoFim = data.prazoFim;
    if (typeof data.municipio !== "undefined") payload.municipio = data.municipio;
    if (typeof data.nte !== "undefined") payload.nte = data.nte;
    if (typeof data.qtdMatriculas !== "undefined") payload.qtdMatriculas = data.qtdMatriculas;

    return await prisma.$transaction(async (tx) => {
      // Atualiza cabeçalho
      await tx.plan.update({
        where: { id: planId },
        data: payload,
      });

      // Itens: fazemos upsert ao invés de deletar tudo (evita FK e preserva ids)
      if (data.items) {
        // pega ids atuais
        const existing = await tx.planItem.findMany({
          where: { planId },
          select: { id: true },
        });
        const existingIds = new Set(existing.map((i) => i.id));
        const incomingIds = new Set((data.items || []).map((i) => i.id).filter(Boolean) as string[]);

        // remove os itens que não vieram mais (e limpa issues antes)
        const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
        if (toDelete.length) {
          await tx.planReturnIssue.updateMany({
            where: { planId, itemId: { in: toDelete } },
            data: { itemId: null },
          });
          await tx.planItem.deleteMany({ where: { id: { in: toDelete } } });
        }

        // upsert dos itens que vieram
        for (const it of data.items) {
          if (it.id && existingIds.has(it.id)) {
            await tx.planItem.update({
              where: { id: it.id },
              data: {
                description: it.description,
                unidade: it.unidade ?? null,
                quantidade: it.quantidade,
                valorUnitario: it.valorUnitario,
                tipo: it.tipo,
              },
            });
          } else {
            await tx.planItem.create({
              data: {
                planId,
                description: it.description,
                unidade: it.unidade ?? null,
                quantidade: it.quantidade,
                valorUnitario: it.valorUnitario,
                tipo: it.tipo,
              },
            });
          }
        }
      }

      // Cursos: mesma lógica “upsert”
      if (data.courses) {
        const existing = await tx.planCourse.findMany({
          where: { planId },
          select: { id: true },
        });
        const existingIds = new Set(existing.map((i) => i.id));
        const incomingIds = new Set((data.courses || []).map((c) => c.id).filter(Boolean) as string[]);

        const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
        if (toDelete.length) {
          await tx.planCourse.deleteMany({ where: { id: { in: toDelete } } });
        }

        for (const c of data.courses) {
          if (c.id && existingIds.has(c.id)) {
            await tx.planCourse.update({
              where: { id: c.id },
              data: {
                name: c.name,
                modality: c.modality ?? null,
                studentsQuantity: c.studentsQuantity,
              },
            });
          } else {
            await tx.planCourse.create({
              data: {
                planId,
                name: c.name,
                modality: c.modality ?? null,
                studentsQuantity: c.studentsQuantity,
              },
            });
          }
        }
      }

      // <<< NOVO: limpa issues dos itens editados que o front informar
      if (data.resolveIssuesForItemIds && data.resolveIssuesForItemIds.length) {
        await tx.planReturnIssue.deleteMany({
          where: {
            planId,
            itemId: { in: data.resolveIssuesForItemIds },
          },
        });
      }

      // retorna o plano atualizado
      const updated = await tx.plan.findUnique({
        where: { id: planId },
        include: {
          items: true,
          courses: true,
          signatures: true,
        },
      });

      return { plan: updated };
    });
  }
}
