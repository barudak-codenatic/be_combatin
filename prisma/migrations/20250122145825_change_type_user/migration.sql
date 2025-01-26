/*
  Warnings:

  - The `verified_at` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "verified_at",
ADD COLUMN     "verified_at" TIMESTAMP(3);
