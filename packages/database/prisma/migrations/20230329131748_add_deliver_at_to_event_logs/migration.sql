-- AlterTable
ALTER TABLE "EventLog" ADD COLUMN     "deliverAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
