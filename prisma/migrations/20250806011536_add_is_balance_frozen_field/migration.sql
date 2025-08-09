-- AlterTable
ALTER TABLE "BuybackOffer" ADD COLUMN     "status" TEXT,
ALTER COLUMN "reward" DROP NOT NULL;
