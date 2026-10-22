import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@flyora/types";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      role: UserRole;
    };
    user: {
      id: string;
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
  const secret = process.env.JWT_SECRET || "flyora-super-secret-jwt-key-2026";

  await fastify.register(fastifyJwt, {
    secret,
  });

  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Invalid or expired authentication token",
        });
      }
    },
  );
};

export default fp(jwtPlugin, {
  name: "jwt",
});
