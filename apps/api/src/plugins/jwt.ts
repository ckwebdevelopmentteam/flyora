import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@flyora/types";
import { authConfig, UUID } from "../modules/auth/auth.config";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; sid: string; type: "access" };
    user: {
      id: string;
      sid: string;
      type: "access";
      email: string;
      role: UserRole;
    };
  }
}
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}
const jwtPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: authConfig().secret,
    sign: { iss: "flyora-api", aud: "flyora-admin" },
    verify: {
      allowedIss: "flyora-api",
      allowedAud: "flyora-admin",
      algorithms: ["HS256"],
    },
  });
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.code(401).send({
          statusCode: 401,
          message: "Invalid or expired authentication token",
        });
        return;
      }
      const { id, sid, type } = request.user;
      if (type !== "access" || !id || !sid || !UUID.test(sid)) {
        reply
          .code(401)
          .send({ statusCode: 401, message: "Invalid authentication token" });
        return;
      }
      // Database failures propagate as 5xx, never masquerade as expired sessions.
      const session = await fastify.prisma.authSession.findUnique({
        where: { id: sid },
        include: { user: true },
      });
      if (
        !session ||
        session.userId !== id ||
        session.revokedAt ||
        session.expiresAt <= new Date() ||
        !session.user.isActive
      ) {
        reply
          .code(401)
          .send({ statusCode: 401, message: "Session expired or revoked" });
        return;
      }
      request.user.email = session.user.email;
      request.user.role = session.user.role;
    },
  );
};
export default fp(jwtPlugin, { name: "jwt", dependencies: ["prisma"] });
