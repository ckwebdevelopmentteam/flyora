import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { LoginInput } from "@flyora/validators";
import { UserProfile } from "@flyora/types";

export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  async login(input: LoginInput) {
    const user = await this.fastify.prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error(
        "Account has been deactivated. Please contact an administrator.",
      );
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.fastify.jwt.sign(payload, {
      expiresIn: "1d",
    });

    const refreshToken = this.fastify.jwt.sign(payload, {
      expiresIn: "7d",
    });

    const profile: UserProfile = {
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

    return {
      user: profile,
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string): Promise<UserProfile> {
    const user = await this.fastify.prisma.user.findUnique({
      where: { id: userId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
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

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.fastify.jwt.verify<{
        id: string;
        email: string;
        role: any;
      }>(refreshToken);

      const user = await this.fastify.prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isActive) {
        throw new Error("User inactive or invalid");
      }

      const newAccessToken = this.fastify.jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        { expiresIn: "1d" },
      );

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }
  }
}
