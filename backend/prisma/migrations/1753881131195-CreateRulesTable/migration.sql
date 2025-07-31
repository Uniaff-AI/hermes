-- CreateTable
CREATE TABLE
  "rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "offerName" TEXT NOT NULL,
    "periodMinutes" INTEGER NOT NULL,
    "minInterval" INTEGER NOT NULL,
    "maxInterval" INTEGER NOT NULL,
    "dailyLimit" INTEGER NOT NULL,
    "sendWindowStart" TEXT NOT NULL,
    "sendWindowEnd" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
  );