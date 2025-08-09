/*
  Warnings:

  - The `level` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('VIP1', 'VIP2');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "level",
ADD COLUMN     "level" "UserLevel" NOT NULL DEFAULT 'VIP1',
ALTER COLUMN "role" SET DEFAULT 'USER';
