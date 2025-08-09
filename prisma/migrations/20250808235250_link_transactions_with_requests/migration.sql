-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "topUpRequestId" INTEGER,
ADD COLUMN     "withdrawalId" INTEGER;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_topUpRequestId_fkey" FOREIGN KEY ("topUpRequestId") REFERENCES "TopUpRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
