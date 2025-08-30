/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Repo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Repo_fullName_key";

-- CreateIndex
CREATE UNIQUE INDEX "Repo_url_key" ON "public"."Repo"("url");
