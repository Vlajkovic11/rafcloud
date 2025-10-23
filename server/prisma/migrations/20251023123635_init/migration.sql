/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentReaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventReaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rsvp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentReaction" DROP CONSTRAINT "CommentReaction_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventReaction" DROP CONSTRAINT "EventReaction_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventTag" DROP CONSTRAINT "EventTag_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventTag" DROP CONSTRAINT "EventTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventView" DROP CONSTRAINT "EventView_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Rsvp" DROP CONSTRAINT "Rsvp_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Rsvp" DROP CONSTRAINT "Rsvp_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "createdAt",
DROP COLUMN "fullName",
DROP COLUMN "role",
DROP COLUMN "status",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Category";

-- DropTable
DROP TABLE "public"."Comment";

-- DropTable
DROP TABLE "public"."CommentReaction";

-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."EventReaction";

-- DropTable
DROP TABLE "public"."EventTag";

-- DropTable
DROP TABLE "public"."EventView";

-- DropTable
DROP TABLE "public"."Rsvp";

-- DropTable
DROP TABLE "public"."Tag";

-- DropEnum
DROP TYPE "public"."ReactionType";

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Machine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ErrorLog" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "machineId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_PermissionToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PermissionToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PermissionToUser_B_index" ON "public"."_PermissionToUser"("B");

-- AddForeignKey
ALTER TABLE "public"."Machine" ADD CONSTRAINT "Machine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ErrorLog" ADD CONSTRAINT "ErrorLog_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "public"."Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
