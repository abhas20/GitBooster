-- DropForeignKey
ALTER TABLE "public"."Analysis" DROP CONSTRAINT "Analysis_repoId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Analysis" ADD CONSTRAINT "Analysis_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "public"."Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
