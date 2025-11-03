import { prisma } from '../lib/prisma.js'
import bcrypt from 'bcrypt'

function rand(min: number, max: number) { return Math.floor(Math.random()*(max-min+1)) + min }

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@example.com', role: 'ADMIN', passwordHash: await bcrypt.hash('admin', 10) }
  })

  for (let i=1;i<=50;i++) {
    const unit = await prisma.schoolUnit.upsert({
      where: { mecCode: String(100000+i) },
      update: {},
      create: { mecCode: String(100000+i), name: `Escola ${i}`, municipio: 'Cidade '+((i%10)+1), nte: 'NTE '+((i%5)+1), escritorioCriativo: ['IMPLANTADO','PLANEJAMENTO','NAO_APLICA'][i%3] as any, projetoAgroecologico: ['IMPLANTADO','PLANEJAMENTO','NAO_APLICA'][(i+1)%3] as any, labRobotica: ['IMPLANTADO','PLANEJAMENTO','NAO_APLICA'][(i+2)%3] as any, labInformatica: ['IMPLANTADO','PLANEJAMENTO','NAO_APLICA'][(i+3)%3] as any }
    })
    await prisma.unitBudget.upsert({ where: { schoolUnitId_type: { schoolUnitId: unit.id, type: 'CUSTEIO' } }, update: { initialAmount: rand(50000,150000) }, create: { schoolUnitId: unit.id, type: 'CUSTEIO', initialAmount: rand(50000,150000), committed: 0 } })
    await prisma.unitBudget.upsert({ where: { schoolUnitId_type: { schoolUnitId: unit.id, type: 'CAPITAL' } }, update: { initialAmount: rand(20000,80000) }, create: { schoolUnitId: unit.id, type: 'CAPITAL', initialAmount: rand(20000,80000), committed: 0 } })

    // approve one plan per unit
    const items = [
      { description: 'Custeio item', unidade: 'un', quantidade: rand(1,10), valorUnitario: rand(100,1000), tipo: 'CUSTEIO' as const },
      { description: 'Capital item', unidade: 'un', quantidade: rand(1,5), valorUnitario: rand(1000,5000), tipo: 'CAPITAL' as const },
    ]
    const plan = await prisma.plan.create({ data: { title: `Plano ${i}`, description: '', solution: '', prazoInicio: '2025-10-01', prazoFim: '2025-10-31', qtdMatriculas: 100, municipio: 'Cidade', nte: 'NTE', schoolUnitId: unit.id, status: 'APROVADO', approvedAt: new Date(), items: { create: items } } })
    const cust = items.filter(i=>i.tipo==='CUSTEIO').reduce((a,i)=>a+i.quantidade*i.valorUnitario,0)
    const cap = items.filter(i=>i.tipo==='CAPITAL').reduce((a,i)=>a+i.quantidade*i.valorUnitario,0)
    await prisma.unitBudget.update({ where: { schoolUnitId_type: { schoolUnitId: unit.id, type: 'CUSTEIO' } }, data: { committed: { increment: cust } } })
    await prisma.unitBudget.update({ where: { schoolUnitId_type: { schoolUnitId: unit.id, type: 'CAPITAL' } }, data: { committed: { increment: cap } } })
  }
  console.log('Seed mass concluído.')
}
main().finally(()=>process.exit(0))