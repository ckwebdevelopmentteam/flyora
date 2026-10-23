import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { PrismaClient, UserRole, StaffAvailability } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("The demo seed cannot run in production");
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const staffPassword = process.env.DEMO_STAFF_PASSWORD;
  if (
    !adminPassword ||
    !staffPassword ||
    [adminPassword, staffPassword].some(
      (value) => Buffer.byteLength(value) < 16 || Buffer.byteLength(value) > 72,
    )
  )
    throw new Error(
      "Set ADMIN_BOOTSTRAP_PASSWORD and DEMO_STAFF_PASSWORD to 16–72 byte passwords before running the development seed",
    );
  console.log("🌱 Starting Flyora database seed...");

  // 1. Seed Core Services
  const servicesData = [
    {
      name: "Holiday Packages",
      slug: "holiday-packages",
      description:
        "Customized domestic and international holiday tour packages.",
      minMarginPercent: 12.0,
    },
    {
      name: "Visa Assistance",
      slug: "visa-assistance",
      description:
        "Tourist and business visa documentation and application processing.",
      minMarginPercent: 20.0,
    },
    {
      name: "Flight Booking",
      slug: "flight-booking",
      description:
        "Domestic and international airline tickets and group fares.",
      minMarginPercent: 5.0,
    },
    {
      name: "Umrah & Hajj",
      slug: "umrah-hajj",
      description:
        "Pilgrimage packages, visa, flights, and direct hotel arrangements in Makkah and Madinah.",
      minMarginPercent: 15.0,
    },
    {
      name: "Hotel Booking",
      slug: "hotel-booking",
      description: "Worldwide luxury and budget hotel reservations.",
      minMarginPercent: 10.0,
    },
  ];

  const createdServices: Record<string, any> = {};

  for (const s of servicesData) {
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        minMarginPercent: s.minMarginPercent,
        description: s.description,
      },
      create: s,
    });
    createdServices[s.slug] = service;
    console.log(`✅ Service seeded: ${s.name}`);
  }

  // 2. Seed Default Super Admin
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@flyora.com" },
    update: {
      // Existing credentials and role are not reset by a seed rerun.
    },
    create: {
      email: "admin@flyora.com",
      passwordHash: adminPasswordHash,
      fullName: "Flyora Super Admin",
      phone: "+919999900000",
      role: UserRole.SUPER_ADMIN,
      availability: StaffAvailability.AVAILABLE,
    },
  });
  console.log(`👑 Super Admin seeded: ${adminUser.email}`);

  // 3. Seed Sample Coordinators with Phone Numbers
  const staffPasswordHash = await bcrypt.hash(staffPassword, 12);

  // Visa Coordinator
  const visaCoordinator = await prisma.user.upsert({
    where: { email: "visa.coord@flyora.com" },
    update: {
      phone: "+919876543210",
    },
    create: {
      email: "visa.coord@flyora.com",
      passwordHash: staffPasswordHash,
      fullName: "Arun (Visa Coordinator)",
      phone: "+919876543210",
      role: UserRole.SERVICE_COORDINATOR,
      availability: StaffAvailability.AVAILABLE,
    },
  });

  if (createdServices["visa-assistance"]) {
    await prisma.userService.upsert({
      where: {
        userId_serviceId: {
          userId: visaCoordinator.id,
          serviceId: createdServices["visa-assistance"].id,
        },
      },
      update: { isPrimary: true },
      create: {
        userId: visaCoordinator.id,
        serviceId: createdServices["visa-assistance"].id,
        isPrimary: true,
      },
    });
    console.log(
      `👤 Coordinator seeded: ${visaCoordinator.fullName} -> Visa Assistance`,
    );
  }

  // Holidays Coordinator
  const holidayCoordinator = await prisma.user.upsert({
    where: { email: "holidays.coord@flyora.com" },
    update: {
      phone: "+919876543211",
    },
    create: {
      email: "holidays.coord@flyora.com",
      passwordHash: staffPasswordHash,
      fullName: "Fatima (Holidays Coordinator)",
      phone: "+919876543211",
      role: UserRole.SERVICE_COORDINATOR,
      availability: StaffAvailability.AVAILABLE,
    },
  });

  if (createdServices["holiday-packages"]) {
    await prisma.userService.upsert({
      where: {
        userId_serviceId: {
          userId: holidayCoordinator.id,
          serviceId: createdServices["holiday-packages"].id,
        },
      },
      update: { isPrimary: true },
      create: {
        userId: holidayCoordinator.id,
        serviceId: createdServices["holiday-packages"].id,
        isPrimary: true,
      },
    });
    console.log(
      `👤 Coordinator seeded: ${holidayCoordinator.fullName} -> Holiday Packages`,
    );
  }

  console.log("✨ Flyora database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
