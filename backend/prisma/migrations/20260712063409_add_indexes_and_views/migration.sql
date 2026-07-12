-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('Available', 'On Trip', 'In Shop', 'Retired');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('Available', 'On Trip', 'Off Duty', 'Suspended');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('Draft', 'Dispatched', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('Active', 'Closed');

-- CreateTable
CREATE TABLE "transit_user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "transit_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_vehicle" (
    "id" SERIAL NOT NULL,
    "registration_number" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "max_load_capacity" DOUBLE PRECISION NOT NULL,
    "current_odometer" DOUBLE PRECISION NOT NULL,
    "acquisition_cost" DOUBLE PRECISION NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'Available',

    CONSTRAINT "transit_vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_driver" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_category" TEXT NOT NULL,
    "license_expiry_date" TIMESTAMP(3) NOT NULL,
    "contact_number" TEXT NOT NULL,
    "safety_score" DOUBLE PRECISION NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'Available',

    CONSTRAINT "transit_driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_trip" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "cargo_weight" DOUBLE PRECISION NOT NULL,
    "planned_distance" DOUBLE PRECISION NOT NULL,
    "actual_distance_traveled" DOUBLE PRECISION,
    "fuel_consumed" DOUBLE PRECISION,
    "revenue" DOUBLE PRECISION NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_maintenance_log" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'Active',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_maintenance_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_fuel_log" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "odometer_reading" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_fuel_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_expense" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "expense_type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "transit_expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transit_user_email_key" ON "transit_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "transit_vehicle_registration_number_key" ON "transit_vehicle"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "transit_driver_license_number_key" ON "transit_driver"("license_number");

-- CreateIndex
CREATE INDEX "transit_trip_vehicle_id_idx" ON "transit_trip"("vehicle_id");

-- CreateIndex
CREATE INDEX "transit_trip_driver_id_idx" ON "transit_trip"("driver_id");

-- CreateIndex
CREATE INDEX "transit_maintenance_log_vehicle_id_idx" ON "transit_maintenance_log"("vehicle_id");

-- CreateIndex
CREATE INDEX "transit_fuel_log_vehicle_id_idx" ON "transit_fuel_log"("vehicle_id");

-- CreateIndex
CREATE INDEX "transit_expense_vehicle_id_idx" ON "transit_expense"("vehicle_id");

-- AddForeignKey
ALTER TABLE "transit_trip" ADD CONSTRAINT "transit_trip_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transit_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_trip" ADD CONSTRAINT "transit_trip_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "transit_driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_maintenance_log" ADD CONSTRAINT "transit_maintenance_log_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transit_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_fuel_log" ADD CONSTRAINT "transit_fuel_log_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transit_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_expense" ADD CONSTRAINT "transit_expense_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transit_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create partial index on Available vehicles
CREATE INDEX IF NOT EXISTS idx_vehicle_available_pool ON transit_vehicle (id) WHERE status = 'Available';

-- Create partial index on Available drivers
CREATE INDEX IF NOT EXISTS idx_driver_available_pool ON transit_driver (id) WHERE status = 'Available';

-- Create analytical view for vehicle financials and efficiency
CREATE OR REPLACE VIEW vehicle_analytics AS
SELECT 
    v.id,
    v.registration_number,
    v.model_name,
    v.acquisition_cost,
    
    COALESCE(SUM(DISTINCT t.revenue), 0)::double precision AS total_revenue,
    COALESCE(SUM(DISTINCT f.cost), 0)::double precision AS total_fuel_cost,
    COALESCE(SUM(DISTINCT m.cost), 0)::double precision AS total_maintenance_cost,
    COALESCE(SUM(DISTINCT e.amount), 0)::double precision AS total_other_expenses,
    
    (COALESCE(SUM(DISTINCT f.cost), 0) + COALESCE(SUM(DISTINCT m.cost), 0) + COALESCE(SUM(DISTINCT e.amount), 0))::double precision AS total_operational_cost,
    (COALESCE(SUM(DISTINCT t.revenue), 0) - (COALESCE(SUM(DISTINCT f.cost), 0) + COALESCE(SUM(DISTINCT m.cost), 0) + COALESCE(SUM(DISTINCT e.amount), 0)))::double precision AS net_profit,
    
    COALESCE(SUM(DISTINCT t.actual_distance_traveled), 0)::double precision AS total_distance,
    COALESCE(SUM(DISTINCT f.liters), 0)::double precision AS total_fuel_liters,
    
    CASE 
        WHEN COALESCE(SUM(DISTINCT f.liters), 0) > 0 THEN (COALESCE(SUM(DISTINCT t.actual_distance_traveled), 0) / COALESCE(SUM(DISTINCT f.liters), 0))::double precision
        ELSE 0::double precision
    END AS fuel_efficiency,
    
    CASE 
        WHEN v.acquisition_cost > 0 THEN ((COALESCE(SUM(DISTINCT t.revenue), 0) - (COALESCE(SUM(DISTINCT m.cost), 0) + COALESCE(SUM(DISTINCT f.cost), 0))) / v.acquisition_cost)::double precision
        ELSE 0::double precision
    END AS roi

FROM transit_vehicle v
LEFT JOIN transit_trip t ON t.vehicle_id = v.id AND t.status = 'Completed'
LEFT JOIN transit_fuel_log f ON f.vehicle_id = v.id
LEFT JOIN transit_maintenance_log m ON m.vehicle_id = v.id
LEFT JOIN transit_expense e ON e.vehicle_id = v.id
GROUP BY v.id, v.registration_number, v.model_name, v.acquisition_cost;
