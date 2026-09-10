-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ADVERTISER');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('TOP', 'MID', 'BOTTOM');

-- CreateEnum
CREATE TYPE "AdSize" AS ENUM ('BANNER', 'GRID');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('SCHEDULED', 'SERVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('IMPRESSION', 'CLICK');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_spaces" (
    "id" TEXT NOT NULL,
    "page_number" INTEGER NOT NULL,
    "position" "Position" NOT NULL,
    "size" "AdSize" NOT NULL,
    "year" INTEGER NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "ad_space_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "priority" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "advertiser_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "target_url" TEXT NOT NULL,
    "status" "AdStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "advertiser_id" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "ad_space_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "price_per_hour" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_daily_inventory" (
    "id" TEXT NOT NULL,
    "ad_space_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_seconds" INTEGER NOT NULL DEFAULT 86400,
    "booked_seconds" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_daily_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_slots" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "ad_space_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_events" (
    "id" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "ad_space_id" TEXT NOT NULL,
    "event_type" "EventType" NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "ad_spaces_page_number_year_idx" ON "ad_spaces"("page_number", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ad_spaces_page_number_position_size_year_key" ON "ad_spaces"("page_number", "position", "size", "year");

-- CreateIndex
CREATE INDEX "pricing_rules_ad_space_id_start_date_end_date_idx" ON "pricing_rules"("ad_space_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "pricing_rules_ad_space_id_priority_idx" ON "pricing_rules"("ad_space_id", "priority");

-- CreateIndex
CREATE INDEX "ads_advertiser_id_status_idx" ON "ads"("advertiser_id", "status");

-- CreateIndex
CREATE INDEX "orders_ad_space_id_date_idx" ON "orders"("ad_space_id", "date");

-- CreateIndex
CREATE INDEX "orders_advertiser_id_created_at_idx" ON "orders"("advertiser_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "space_daily_inventory_ad_space_id_date_key" ON "space_daily_inventory"("ad_space_id", "date");

-- CreateIndex
CREATE INDEX "scheduled_slots_ad_space_id_start_at_end_at_idx" ON "scheduled_slots"("ad_space_id", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "scheduled_slots_order_id_idx" ON "scheduled_slots"("order_id");

-- CreateIndex
CREATE INDEX "ad_events_ad_id_created_at_idx" ON "ad_events"("ad_id", "created_at");

-- CreateIndex
CREATE INDEX "ad_events_order_id_created_at_idx" ON "ad_events"("order_id", "created_at");

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_ad_space_id_fkey" FOREIGN KEY ("ad_space_id") REFERENCES "ad_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_advertiser_id_fkey" FOREIGN KEY ("advertiser_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_advertiser_id_fkey" FOREIGN KEY ("advertiser_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "ads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_ad_space_id_fkey" FOREIGN KEY ("ad_space_id") REFERENCES "ad_spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_daily_inventory" ADD CONSTRAINT "space_daily_inventory_ad_space_id_fkey" FOREIGN KEY ("ad_space_id") REFERENCES "ad_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_slots" ADD CONSTRAINT "scheduled_slots_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_slots" ADD CONSTRAINT "scheduled_slots_ad_space_id_fkey" FOREIGN KEY ("ad_space_id") REFERENCES "ad_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_events" ADD CONSTRAINT "ad_events_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_events" ADD CONSTRAINT "ad_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_events" ADD CONSTRAINT "ad_events_ad_space_id_fkey" FOREIGN KEY ("ad_space_id") REFERENCES "ad_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
