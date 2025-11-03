import { prisma } from '../lib/prisma.js'
import bcrypt from 'bcrypt'

async function main() {
  // admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@example.com', role: 'ADMIN', passwordHash: await bcrypt.hash('admin', 10) }
  })

  // unit
  const unit = await prisma.schoolUnit.upsert({
    where: { mecCode: '123456' },
    update: {},
    create: { mecCode: '123456', name: 'Escola Modelo', municipio: 'Salvador', nte: 'NTE 01', escritorioCriativo: 'PLANEJAMENTO', projetoAgroecologico: 'NAO_APLICA', labRobotica: 'IMPLANTADO', labInformatica: 'PLANEJAMENTO' }
  })

  // budgets
  await prisma.unitBudget.upsert({ where: { schoolUnitId_type: { schoolUnitId: unit.id, type: 'CUSTEIO' } }, update: { initialAmount: 100000 }, create: { schoolUnitId: unit.id, type: 'CUSTEIO', initialAmount: 100000, committed: 0 } })
  await prisma.unitBudget.upsert({ where: { schoolUnitId_type: { schoolUnitId: unit.id, type: 'CAPITAL' } }, update: { initialAmount: 50000 }, create: { schoolUnitId: unit.id, type: 'CAPITAL', initialAmount: 50000, committed: 0 } })

  // draft plan
  const plan = await prisma.plan.create({
    data: {
      title: 'Plano de Ação - Feira de Ciências',
      description: 'Feira de Ciências',
      solution: '',
      prazoInicio: '2025-10-01',
      prazoFim: '2025-10-31',
      qtdMatriculas: 100,
      municipio: 'Salvador',
      nte: 'NTE 01',
      schoolUnitId: unit.id,
      status: 'RASCUNHO',
      items: {
        create: [
          { description: 'Material de Escritório', unidade: 'pacote', quantidade: 10, valorUnitario: 120, tipo: 'CUSTEIO' },
          { description: 'Notebook', unidade: 'un', quantidade: 2, valorUnitario: 3500, tipo: 'CAPITAL' },
        ]
      }
    }
  })

  console.log('Seed concluído:', { admin: admin.email, unit: unit.name, plan: plan.title })
}

main().finally(()=>process.exit(0))