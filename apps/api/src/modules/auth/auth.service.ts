import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { LoginInput } from "@flyora/validators";
import { UserProfile } from "@flyora/types";
import {
  ACCESS_TTL_SECONDS,
  AuthError,
  equalHash,
  hashSecret,
  parseRefresh,
  RECOVERY_WINDOW_MS,
  REFRESH_TRANSACTION_OPTIONS,
  refreshToken,
  SESSION_TTL_SECONDS,
  successorToken,
} from "./auth.config";

// A fixed dummy hash keeps unknown-user and wrong-password checks comparable.
const dummyHash = bcrypt.hashSync("not-a-user-password", 12);
export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  private issueAccess(id: string, sessionId: string) {
    return this.fastify.jwt.sign(
      { id, sid: sessionId, type: "access" },
      { expiresIn: ACCESS_TTL_SECONDS },
    );
  }

  async login(input: LoginInput) {
    const user = await this.fastify.prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });
    const valid = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? dummyHash,
    );
    if (!user || !valid || !user.isActive)
      throw new AuthError("Invalid email or password");
    const id = randomUUID();
    const token = refreshToken(id);
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
    await this.fastify.prisma.authSession.create({
      data: { id, userId: user.id, refreshTokenHash: token.hash, expiresAt },
    });
    return {
      user: await this.getMe(user.id),
      accessToken: this.issueAccess(user.id, id),
      refreshToken: token.raw,
      expiresAt,
    };
  }

  async getMe(userId: string): Promise<UserProfile> {
    const user = await this.fastify.prisma.user.findUnique({
      where: { id: userId },
      include: { services: { include: { service: true } } },
    });
    if (!user || !user.isActive) throw new AuthError();
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

  async refreshAccessToken(raw: string, operation: string) {
    const { id, secret } = parseRefresh(raw);
    const next = successorToken(id, secret, operation);
    const result = await this.fastify.prisma.$transaction(async (tx) => {
      // Serialize rotations across processes; read time AFTER acquiring the lock.
      await tx.$queryRaw`SELECT id FROM "AuthSession" WHERE id = ${id}::uuid FOR UPDATE`;
      const session = await tx.authSession.findUnique({
        where: { id },
        include: { user: true },
      });
      const now = new Date();
      if (!session || session.revokedAt) return null;
      if (session.expiresAt <= now || !session.user.isActive) {
        await tx.authSession.update({
          where: { id },
          data: { revokedAt: now },
        });
        return null;
      }
      const current = equalHash(hashSecret(secret), session.refreshTokenHash);
      const sameOperation = current && secret.startsWith(`v1-${operation}-`);
      const recoveredOldCookie =
        !current && equalHash(next.hash, session.refreshTokenHash);
      const rotationAge = now.getTime() - session.lastUsedAt.getTime();
      const withinRecovery =
        rotationAge >= 0 && rotationAge < RECOVERY_WINDOW_MS;
      if ((sameOperation || recoveredOldCookie) && withinRecovery) {
        return {
          userId: session.userId,
          refreshToken: current ? raw : next.raw,
          expiresAt: session.expiresAt,
        };
      }
      if (!current || sameOperation) {
        // This is a cryptographically authentic stale token, not a guessed sid.
        // Return rather than throw so the transaction commits revocation.
        await tx.authSession.update({
          where: { id },
          data: { revokedAt: now },
        });
        return null;
      }
      await tx.authSession.update({
        where: { id },
        data: { refreshTokenHash: next.hash, lastUsedAt: now },
      });
      return {
        userId: session.userId,
        refreshToken: next.raw,
        expiresAt: session.expiresAt,
      };
    }, REFRESH_TRANSACTION_OPTIONS);
    if (!result) throw new AuthError();
    return {
      user: await this.getMe(result.userId),
      accessToken: this.issueAccess(result.userId, id),
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
    };
  }

  async logout(raw?: string) {
    if (!raw) return;
    let id: string;
    try {
      id = parseRefresh(raw).id;
    } catch {
      return;
    }
    // Any authentic member of the family may revoke it, including a lost-response predecessor.
    await this.fastify.prisma.authSession.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
