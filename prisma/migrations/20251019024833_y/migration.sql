-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTOR', 'SUPROT', 'DIRETOR_SUPROT');

-- CreateEnum
CREATE TYPE "Funcao" AS ENUM ('PROFESSOR', 'COORDENADOR', 'DIRETOR', 'TESOUREIRO', 'PRESIDENTE_CAIXA', 'OUTRO');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('PLANO_EM_CONSTRUCAO', 'EM_ANALISE', 'COLETA_ASSINATURA', 'EM_PROCESSO_DESCENTRALIZACAO', 'PLANO_CONCLUIDO', 'REJEITADO', 'APROVADO');

-- CreateEnum
CREATE TYPE "ItemTipo" AS ENUM ('CUSTEIO', 'CAPITAL');

-- CreateEnum
CREATE TYPE "SignatureKind" AS ENUM ('PRESIDENTE_CAIXA', 'TESOUREIRO', 'OUTRO_MEMBRO', 'DIRETOR_SUPROT');

-- CreateEnum
CREATE TYPE "SignatureMethod" AS ENUM ('ELETRONICA', 'UPLOAD', 'AUTOMATICA');

-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('CUSTEIO', 'CAPITAL');

-- CreateEnum
CREATE TYPE "DecentralizationStatus" AS ENUM ('PENDENTE', 'CONCLUIDA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "funcao" "Funcao" NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'GESTOR',
    "schoolUnitId" TEXT,
    "profileImageKey" TEXT,
    "signatureImageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolUnit" (
    "id" TEXT NOT NULL,
    "mecCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "nte" TEXT NOT NULL,
    "escritorioCriativo" TEXT,
    "projetoAgroecologico" TEXT,
    "labRobotica" TEXT,
    "labInformatica" TEXT,

    CONSTRAINT "SchoolUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "prazoInicio" TEXT NOT NULL,
    "prazoFim" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'PLANO_EM_CONSTRUCAO',
    "qtdMatriculas" INTEGER NOT NULL,
    "municipio" TEXT NOT NULL,
    "nte" TEXT NOT NULL,
    "totalCusteio" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCapital" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalGeral" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "payloadHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "schoolUnitId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" DECIMAL(65,30) NOT NULL,
    "tipo" "ItemTipo" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanCourse" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "studentsQuantity" INTEGER NOT NULL,
    "modality" TEXT NOT NULL,

    CONSTRAINT "PlanCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "signerId" TEXT,
    "kind" "SignatureKind" NOT NULL,
    "method" "SignatureMethod" NOT NULL,
    "imageKey" TEXT,
    "fullName" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentHash" TEXT NOT NULL,
    "originNote" TEXT,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanStatusHistory" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "from" "PlanStatus",
    "to" "PlanStatus" NOT NULL,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "PlanStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitBudget" (
    "id" TEXT NOT NULL,
    "schoolUnitId" TEXT NOT NULL,
    "type" "BudgetType" NOT NULL,
    "initialAmount" DECIMAL(14,2) NOT NULL,
    "committed" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanReturnIssue" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanReturnIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decentralization" (
    "id" TEXT NOT NULL,
    "schoolUnitId" TEXT NOT NULL,
    "planId" TEXT,
    "type" "BudgetType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "DecentralizationStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concludedAt" TIMESTAMP(3),

    CONSTRAINT "Decentralization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricula_key" ON "User"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolUnit_mecCode_key" ON "SchoolUnit"("mecCode");

-- CreateIndex
CREATE UNIQUE INDEX "UnitBudget_schoolUnitId_type_key" ON "UnitBudget"("schoolUnitId", "type");

-- CreateIndex
CREATE INDEX "PlanReturnIssue_planId_idx" ON "PlanReturnIssue"("planId");

-- CreateIndex
CREATE INDEX "PlanReturnIssue_itemId_idx" ON "PlanReturnIssue"("itemId");

-- CreateIndex
CREATE INDEX "Decentralization_schoolUnitId_status_type_idx" ON "Decentralization"("schoolUnitId", "status", "type");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_schoolUnitId_fkey" FOREIGN KEY ("schoolUnitId") REFERENCES "SchoolUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_schoolUnitId_fkey" FOREIGN KEY ("schoolUnitId") REFERENCES "SchoolUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanCourse" ADD CONSTRAINT "PlanCourse_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanStatusHistory" ADD CONSTRAINT "PlanStatusHistory_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitBudget" ADD CONSTRAINT "UnitBudget_schoolUnitId_fkey" FOREIGN KEY ("schoolUnitId") REFERENCES "SchoolUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanReturnIssue" ADD CONSTRAINT "PlanReturnIssue_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanReturnIssue" ADD CONSTRAINT "PlanReturnIssue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "PlanItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decentralization" ADD CONSTRAINT "Decentralization_schoolUnitId_fkey" FOREIGN KEY ("schoolUnitId") REFERENCES "SchoolUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decentralization" ADD CONSTRAINT "Decentralization_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
