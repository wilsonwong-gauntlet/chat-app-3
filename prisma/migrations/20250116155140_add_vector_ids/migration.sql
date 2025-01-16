-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "isAI" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "vectorIds" TEXT[];
