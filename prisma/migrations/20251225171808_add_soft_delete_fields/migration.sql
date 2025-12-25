-- AlterTable
ALTER TABLE "movement_entries" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "movement_exits" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "deletedAt" TIMESTAMP(3);
