-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "transit_alert" (
    "id" SERIAL NOT NULL,
    "driver_id" INTEGER,
    "driver_name" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'medium',
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transit_alert_driver_id_idx" ON "transit_alert"("driver_id");

-- CreateIndex
CREATE INDEX "transit_alert_is_dismissed_idx" ON "transit_alert"("is_dismissed");

-- AddForeignKey
ALTER TABLE "transit_alert" ADD CONSTRAINT "transit_alert_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "transit_driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
