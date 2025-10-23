-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "public"."EventView" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventReaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "type" "public"."ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentReaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    "type" "public"."ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventView_eventId_userId_key" ON "public"."EventView"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventReaction_userId_eventId_key" ON "public"."EventReaction"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_userId_commentId_key" ON "public"."CommentReaction"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "public"."EventView" ADD CONSTRAINT "EventView_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventReaction" ADD CONSTRAINT "EventReaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
