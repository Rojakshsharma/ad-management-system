const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.adEvent.deleteMany();
  await prisma.scheduledSlot.deleteMany();
  await prisma.order.deleteMany();
  await prisma.spaceDailyInventory.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.adSpace.deleteMany();
  await prisma.user.deleteMany();

  // Passwords
  const passwordHash = await bcrypt.hash("password", 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const advertiser = await prisma.user.create({
    data: {
      name: "Advertiser",
      email: "advertiser@example.com",
      passwordHash,
      role: "ADVERTISER",
    },
  });

  console.log("Users created");

  // Create demo ad spaces
  const adSpaces = [];

  for (let pageNumber = 1; pageNumber <= 5; pageNumber++) {
    const top = await prisma.adSpace.create({
      data: {
        pageNumber,
        position: "TOP",
        size: "BANNER",
        year: 2026,
        basePrice: 500,
      },
    });

    const mid = await prisma.adSpace.create({
      data: {
        pageNumber,
        position: "MID",
        size: "GRID",
        year: 2026,
        basePrice: 400,
      },
    });

    const bottom = await prisma.adSpace.create({
      data: {
        pageNumber,
        position: "BOTTOM",
        size: "BANNER",
        year: 2026,
        basePrice: 300,
      },
    });

    adSpaces.push(top, mid, bottom);
  }

  console.log(`${adSpaces.length} ad spaces created`);

  // Pricing rules for Page 1 / TOP / BANNER
  const page1TopBanner = adSpaces.find(
    (space) =>
      space.pageNumber === 1 &&
      space.position === "TOP" &&
      space.size === "BANNER"
  );

  await prisma.pricingRule.create({
    data: {
      adSpaceId: page1TopBanner.id,
      startDate: new Date("2026-09-10"),
      endDate: new Date("2026-09-20"),
      price: 700,
      priority: 1,
      color: "#bfdbfe",
      details: "September promotional pricing",
    },
  });

  await prisma.pricingRule.create({
    data: {
      adSpaceId: page1TopBanner.id,
      startDate: new Date("2026-09-15"),
      endDate: new Date("2026-09-17"),
      price: 1200,
      priority: 2,
      color: "#fca5a5",
      details: "High-demand premium pricing",
    },
  });

  console.log("Pricing rules created");

  console.log("Seed completed successfully");

  console.log("\nCredentials:");
  console.log("Admin: admin@example.com / password");
  console.log("Advertiser: advertiser@example.com / password");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });