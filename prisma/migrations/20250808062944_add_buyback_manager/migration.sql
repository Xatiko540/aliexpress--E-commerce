-- AlterTable
ALTER TABLE "BuybackOffer" ADD COLUMN     "managerId" UUID;

-- AddForeignKey
ALTER TABLE "BuybackOffer" ADD CONSTRAINT "BuybackOffer_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
