import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { CreateUserInput } from "@flyora/validators";
import { StaffAvailability, UserProfile } from "@flyora/types";

export class UsersService {
  constructor(private fastify: FastifyInstance) {}

  async listUsers(): Promise<UserProfile[]> {
    const users = await this.fastify.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      role: u.role,
      availability: u.availability,
      isActive: u.isActive,
      services: u.services.map((s) => ({
        id: s.id,
        userId: s.userId,
        serviceId: s.serviceId,
        isPrimary: s.isPrimary,
        service: {
          id: s.service.id,
          name: s.service.name,
          slug: s.service.slug,
          minMarginPercent: s.service.minMarginPercent,
        },
      })),
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));
  }

  async createUser(input: CreateUserInput): Promise<UserProfile> {
    const existing = await this.fastify.prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error("A user with this email address already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.fastify.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          passwordHash,
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          role: input.role,
        },
      });

      if (input.serviceIds && input.serviceIds.length > 0) {
        const serviceData = input.serviceIds.map((serviceId) => ({
          userId: createdUser.id,
          serviceId,
          isPrimary: serviceId === input.primaryServiceId,
        }));

        await tx.userService.createMany({
          data: serviceData,
        });
      }

      return tx.user.findUnique({
        where: { id: createdUser.id },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      });
    });

    if (!user) {
      throw new Error("Failed to create user");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      availability: user.availability,
      isActive: user.isActive,
      services: user.services.map((s) => ({
        id: s.id,
        userId: s.userId,
        serviceId: s.serviceId,
        isPrimary: s.isPrimary,
        service: {
          id: s.service.id,
          name: s.service.name,
          slug: s.service.slug,
          minMarginPercent: s.service.minMarginPercent,
        },
      })),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateUserServices(
    userId: string,
    serviceIds: string[],
    primaryServiceId?: string,
  ) {
    const user = await this.fastify.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await this.fastify.prisma.$transaction(async (tx) => {
      await tx.userService.deleteMany({
        where: { userId },
      });

      if (serviceIds.length > 0) {
        await tx.userService.createMany({
          data: serviceIds.map((serviceId) => ({
            userId,
            serviceId,
            isPrimary: serviceId === primaryServiceId,
          })),
        });
      }
    });

    return this.fastify.prisma.user.findUnique({
      where: { id: userId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async updateAvailability(userId: string, availability: StaffAvailability) {
    const user = await this.fastify.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return this.fastify.prisma.user.update({
      where: { id: userId },
      data: { availability },
      select: {
        id: true,
        fullName: true,
        availability: true,
      },
    });
  }
}
