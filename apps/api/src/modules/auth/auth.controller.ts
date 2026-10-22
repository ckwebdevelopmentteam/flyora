import { FastifyPluginAsync } from "fastify";
import { AuthService } from "./auth.service";
import { loginSchema } from "@flyora/validators";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService(fastify);

  // POST /api/v1/auth/login
  fastify.post("/login", async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: parseResult.error.errors[0]?.message || "Validation error",
      });
    }

    try {
      const result = await authService.login(parseResult.data);
      return reply.send({
        statusCode: 200,
        data: result,
      });
    } catch (err: any) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: err.message,
      });
    }
  });

  // GET /api/v1/auth/me
  fastify.get(
    "/me",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const user = await authService.getMe(request.user.id);
        return reply.send({
          statusCode: 200,
          data: user,
        });
      } catch (err: any) {
        return reply.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: err.message,
        });
      }
    },
  );

  // POST /api/v1/auth/refresh
  fastify.post("/refresh", async (request, reply) => {
    const { refreshToken } = (request.body as { refreshToken?: string }) || {};
    if (!refreshToken) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Refresh token is required",
      });
    }

    try {
      const result = await authService.refreshAccessToken(refreshToken);
      return reply.send({
        statusCode: 200,
        data: result,
      });
    } catch (err: any) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: err.message,
      });
    }
  });
};
