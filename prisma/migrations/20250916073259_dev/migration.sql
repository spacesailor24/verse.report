-- CreateEnum
CREATE TYPE "public"."TransmissionType" AS ENUM ('OFFICIAL', 'LEAK', 'PREDICTION');

-- CreateEnum
CREATE TYPE "public"."TransmissionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('SHIP', 'PATCH', 'CREATURE', 'LOCATION', 'EVENT', 'FEATURE');

-- CreateTable
CREATE TABLE "public"."Transmission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT NOT NULL,
    "content" TEXT,
    "type" "public"."TransmissionType" NOT NULL,
    "status" "public"."TransmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "sourceAuthor" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "public"."CategoryType" NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShipFamily" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "categoryId" TEXT NOT NULL,
    "shipFamilyId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransmissionTag" (
    "transmissionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,
    "confidence" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "TransmissionTag_pkey" PRIMARY KEY ("transmissionId","tagId")
);

-- CreateIndex
CREATE INDEX "Transmission_type_idx" ON "public"."Transmission"("type");

-- CreateIndex
CREATE INDEX "Transmission_status_idx" ON "public"."Transmission"("status");

-- CreateIndex
CREATE INDEX "Transmission_sourceAuthor_idx" ON "public"."Transmission"("sourceAuthor");

-- CreateIndex
CREATE INDEX "Transmission_publishedAt_idx" ON "public"."Transmission"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE INDEX "Category_type_idx" ON "public"."Category"("type");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "public"."Category"("slug");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "public"."Category"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ShipFamily_name_key" ON "public"."ShipFamily"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShipFamily_slug_key" ON "public"."ShipFamily"("slug");

-- CreateIndex
CREATE INDEX "ShipFamily_slug_idx" ON "public"."ShipFamily"("slug");

-- CreateIndex
CREATE INDEX "ShipFamily_sortOrder_idx" ON "public"."ShipFamily"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "public"."Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "public"."Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "public"."Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_categoryId_idx" ON "public"."Tag"("categoryId");

-- CreateIndex
CREATE INDEX "Tag_shipFamilyId_idx" ON "public"."Tag"("shipFamilyId");

-- CreateIndex
CREATE INDEX "Tag_sortOrder_idx" ON "public"."Tag"("sortOrder");

-- CreateIndex
CREATE INDEX "TransmissionTag_transmissionId_idx" ON "public"."TransmissionTag"("transmissionId");

-- CreateIndex
CREATE INDEX "TransmissionTag_tagId_idx" ON "public"."TransmissionTag"("tagId");

-- CreateIndex
CREATE INDEX "TransmissionTag_addedAt_idx" ON "public"."TransmissionTag"("addedAt");

-- AddForeignKey
ALTER TABLE "public"."Tag" ADD CONSTRAINT "Tag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tag" ADD CONSTRAINT "Tag_shipFamilyId_fkey" FOREIGN KEY ("shipFamilyId") REFERENCES "public"."ShipFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransmissionTag" ADD CONSTRAINT "TransmissionTag_transmissionId_fkey" FOREIGN KEY ("transmissionId") REFERENCES "public"."Transmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransmissionTag" ADD CONSTRAINT "TransmissionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
