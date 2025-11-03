import { prisma } from '../../lib/prisma.js'

type ListUnitsInput = {
  q?: string
  page?: number
  perPage?: number
  municipio?: string
  nte?: string
  escritorioCriativo?: string
  projetoAgroecologico?: string
  labRobotica?: string
  labInformatica?: string
}

export class ListUnitsUseCase {
  async execute(input: ListUnitsInput) {
    const page = Number.isFinite(input?.page as number) && (input!.page as number) > 0 ? Number(input!.page) : 1
    const perPage =
      Number.isFinite(input?.perPage as number) && (input!.perPage as number) > 0 && (input!.perPage as number) <= 100
        ? Number(input!.perPage)
        : 10

    const skip = (page - 1) * perPage
    const take = perPage

    const where: any = {}

    const q = (input.q ?? '').trim()
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { mecCode: { contains: q, mode: 'insensitive' } },
        { municipio: { contains: q, mode: 'insensitive' } },
        { nte: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (input.municipio) where.municipio = { equals: input.municipio, mode: 'insensitive' }
    if (input.nte) where.nte = { equals: input.nte, mode: 'insensitive' }

    // Status filters (IMPLANTADO, PLANEJAMENTO, NAO_APLICA)
    if (input.escritorioCriativo) where.statusEscritorioCriativo = input.escritorioCriativo
    if (input.projetoAgroecologico) where.statusProjetoAgroecologico = input.projetoAgroecologico
    if (input.labRobotica) where.statusLabRobotica = input.labRobotica
    if (input.labInformatica) where.statusLabInformatica = input.labInformatica

    const [items, total] = await Promise.all([
      prisma.schoolUnit.findMany({
        where, skip, take,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, mecCode: true, municipio: true, nte: true, escritorioCriativo: true, projetoAgroecologico: true, labRobotica: true,labInformatica: true }
      }),
      prisma.schoolUnit.count({ where })
    ])

    return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) }
  }
}