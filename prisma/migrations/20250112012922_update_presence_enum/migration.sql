/*
  Warnings:

  - The `presence` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'AWAY', 'DND');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "presence",
ADD COLUMN     "presence" "PresenceStatus" NOT NULL DEFAULT 'OFFLINE';
