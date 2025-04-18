-- CreateTable
CREATE TABLE "railway_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headquarters" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "railway_zones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "railway_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
