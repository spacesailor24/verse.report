-- AlterTable
ALTER TABLE "public"."Transmission" ADD COLUMN     "publisherId" TEXT;

-- CreateIndex
CREATE INDEX "Transmission_publisherId_idx" ON "public"."Transmission"("publisherId");

-- AddForeignKey
ALTER TABLE "public"."Transmission" ADD CONSTRAINT "Transmission_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
