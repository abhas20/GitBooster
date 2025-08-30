/*
  Warnings:

  - Added the required column `url` to the `Repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Repo" ADD COLUMN     "url" TEXT NOT NULL;
