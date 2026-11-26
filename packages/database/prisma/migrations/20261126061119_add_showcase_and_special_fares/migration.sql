-- CreateEnum
CREATE TYPE "FlightType" AS ENUM ('NON_STOP', 'CONNECTING');

-- CreateEnum
CREATE TYPE "CabinClass" AS ENUM ('ECONOMY', 'BUSINESS', 'FIRST_CLASS');

-- CreateEnum
CREATE TYPE "SpecialFareStatus" AS ENUM ('ACTIVE', 'SOLD_OUT', 'EXPIRED', 'PAUSED');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "featuredOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "popularOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isDomestic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isInternational" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "ShowcaseConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "popularTitle" TEXT NOT NULL DEFAULT 'Popular packages',
    "popularEyebrow" TEXT NOT NULL DEFAULT 'PLAN YOUR NEXT TRIP',
    "popularActive" BOOLEAN NOT NULL DEFAULT true,
    "featuredTitle" TEXT NOT NULL DEFAULT 'Featured packages',
    "featuredEyebrow" TEXT NOT NULL DEFAULT 'FLYORA CURATED JOURNEYS',
    "featuredActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialFareTicket" (
    "id" TEXT NOT NULL,
    "airlineName" TEXT NOT NULL,
    "airlineCode" TEXT,
    "flightNumber" TEXT,
    "originCity" TEXT NOT NULL,
    "originCode" TEXT NOT NULL,
    "originTerminal" TEXT,
    "destinationCity" TEXT NOT NULL,
    "destinationCode" TEXT NOT NULL,
    "destinationTerminal" TEXT,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "arrivalDate" TIMESTAMP(3),
    "flightType" "FlightType" NOT NULL DEFAULT 'NON_STOP',
    "cabinClass" "CabinClass" NOT NULL DEFAULT 'ECONOMY',
    "rbd" TEXT,
    "baggageInfo" TEXT NOT NULL,
    "isRefundable" BOOLEAN NOT NULL DEFAULT false,
    "totalSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "originalFare" DECIMAL(10,2),
    "farePerSeat" DECIMAL(10,2) NOT NULL,
    "childFare" DECIMAL(10,2),
    "infantFare" DECIMAL(10,2),
    "supplierCost" DECIMAL(10,2),
    "pnrNumber" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "SpecialFareStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialFareTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpecialFareTicket_isActive_expiresAt_availableSeats_idx" ON "SpecialFareTicket"("isActive", "expiresAt", "availableSeats");

-- CreateIndex
CREATE INDEX "SpecialFareTicket_originCode_destinationCode_departureDate_idx" ON "SpecialFareTicket"("originCode", "destinationCode", "departureDate");

-- CreateIndex
CREATE INDEX "SpecialFareTicket_departureDate_status_idx" ON "SpecialFareTicket"("departureDate", "status");
