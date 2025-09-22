/*
  Warnings:

  - Made the column `publisherId` on table `Transmission` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Transmission" DROP CONSTRAINT "Transmission_publisherId_fkey";

-- AlterTable
ALTER TABLE "public"."Transmission" ALTER COLUMN "publisherId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Transmission" ADD CONSTRAINT "Transmission_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
