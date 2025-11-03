import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'

type SignatureBlock = {
  imagePath?: string
  nome: string
  cargo: string
  dataHora: string
  origem?: string
}

export function buildPlanPdf({
  outputPath,
  header,
  info,
  items,
  signatures,
}: {
  outputPath: string
  header: { titulo: string }
  info: Record<string, string | number>
  items: Array<{ descricao: string; unidade: string; qtd: number; unit: string; total: string; tipo: string }>
  signatures: SignatureBlock[]
}) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' })
  doc.pipe(fs.createWriteStream(outputPath))

  doc.fontSize(18).text('InvestEdu - Plano de Ação', { align: 'center' }).moveDown(0.5)
  doc.fontSize(14).text(header.titulo, { align: 'center' }).moveDown()

  doc.fontSize(10)
  Object.entries(info).forEach(([k, v]) => doc.text(`${k}: ${v}`))
  doc.moveDown()

  doc.fontSize(12).text('Itens do Plano', { underline: true }).moveDown(0.5)
  doc.fontSize(10)
  items.forEach(i => {
    doc.text(`• ${i.descricao} | ${i.tipo} | ${i.unidade} | Qtd: ${i.qtd} | Unit: ${i.unit} | Total: ${i.total}`)
  })
  doc.moveDown()

  doc.fontSize(12).text('Assinaturas dos Responsáveis', { underline: true }).moveDown(0.5)
  signatures.forEach(sig => {
    if (sig.imagePath && fs.existsSync(sig.imagePath)) {
      const y = doc.y
      doc.image(sig.imagePath, { width: 120 })
      doc.y = y + 90
    }
    doc.fontSize(10).text(`Nome: ${sig.nome}`)
    doc.text(`Cargo: ${sig.cargo}`)
    doc.text(`Data/Hora: ${sig.dataHora}`)
    if (sig.origem) doc.text(`Origem: ${sig.origem}`)
    doc.moveDown()
  })

  doc.end()
}

export async function buildUnitPdf({
  outputPath,
  unit,
  budget,
  plans
}: {
  outputPath: string,
  unit: { name: string, inep?: string|null, municipio?: string|null, nte?: string|null },
  budget: { custeio: { inicial: number, comprometido: number }, capital: { inicial: number, comprometido: number } },
  plans: Array<{ id: string, title: string, aprovadoEm: Date|null, custeio: number, capital: number, total: number }>
}) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  const stream = fs.createWriteStream(outputPath)
  doc.pipe(stream)

  doc.fontSize(16).text('Unidade Escolar', { align: 'left', underline: true })
  doc.moveDown(0.3)
  doc.fontSize(12).text(`Nome: ${unit.name}`)
  if (unit.inep) doc.text(`INEP/MEC: ${unit.inep}`)
  if (unit.municipio) doc.text(`Município: ${unit.municipio}`)
  if (unit.nte) doc.text(`NTE: ${unit.nte}`)
  doc.moveDown()

  const inicialTotal = budget.custeio.inicial + budget.capital.inicial
  const compTotal = budget.custeio.comprometido + budget.capital.comprometido
  const dispTotal = inicialTotal - compTotal

  doc.fontSize(14).text('Resumo Orçamentário', { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(11)
  doc.text(`Inicial Total: R$ ${inicialTotal.toFixed(2)}`)
  doc.text(`Comprometido Total: R$ ${compTotal.toFixed(2)}`)
  doc.text(`Disponível Total: R$ ${dispTotal.toFixed(2)}`)
  doc.moveDown(0.6)
  doc.text(`Custeio — Inicial: R$ ${budget.custeio.inicial.toFixed(2)} | Comprometido: R$ ${budget.custeio.comprometido.toFixed(2)} | Disponível: R$ ${(budget.custeio.inicial - budget.custeio.comprometido).toFixed(2)}`)
  doc.text(`Capital  — Inicial: R$ ${budget.capital.inicial.toFixed(2)} | Comprometido: R$ ${budget.capital.comprometido.toFixed(2)} | Disponível: R$ ${(budget.capital.inicial - budget.capital.comprometido).toFixed(2)}`)
  doc.moveDown()

  doc.fontSize(14).text('Planos Aprovados', { underline: true })
  doc.moveDown(0.3)
  if (plans.length === 0) {
    doc.fontSize(11).text('Nenhum plano aprovado.')
  } else {
    plans.forEach((p, idx) => {
      doc.fontSize(12).text(`${idx+1}. ${p.title}`)
      doc.fontSize(10).text(`Aprovado em: ${p.aprovadoEm ? new Date(p.aprovadoEm).toLocaleDateString('pt-BR') : '-'}`)
      doc.text(`Custeio: R$ ${p.custeio.toFixed(2)} | Capital: R$ ${p.capital.toFixed(2)} | Total: R$ ${p.total.toFixed(2)}`)
      doc.moveDown(0.4)
    })
  }

  doc.end()
  return new Promise<void>((resolve) => {
    stream.on('finish', () => resolve())
  })
}
