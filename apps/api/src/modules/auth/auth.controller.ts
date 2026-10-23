import { FastifyPluginAsync } from "fastify";
import { AuthService } from "./auth.service";
import { loginSchema } from "@flyora/validators";
import { ACCESS_TTL_SECONDS, authConfig, UUID } from "./auth.config";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new AuthService(fastify);
  const config = authConfig();
  const cookieOptions = {
    httpOnly: true,
    secure: config.production,
    sameSite: "lax" as const,
    path: "/",
  };
  fastify.addHook("onRequest", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    if (
      request.method !== "GET" &&
      request.method !== "OPTIONS" &&
      (!request.headers.origin ||
        !config.origins.includes(request.headers.origin))
    ) {
      return reply
        .code(403)
        .send({ statusCode: 403, message: "Untrusted request origin" });
    }
  });
  function respond(
    reply: import("fastify").FastifyReply,
    result: Awaited<ReturnType<AuthService["login"]>>,
  ) {
    reply.setCookie(config.cookieName, result.refreshToken, {
      ...cookieOptions,
      expires: result.expiresAt,
    });
    return reply.send({
      statusCode: 200,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        accessExpiresIn: ACCESS_TTL_SECONDS,
      },
    });
  }
  fastify.post(
    "/login",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success)
        return reply
          .code(400)
          .send({ statusCode: 400, message: "Invalid login details" });
      return respond(reply, await service.login(parsed.data));
    },
  );
  fastify.get(
    "/me",
    { preHandler: [fastify.authenticate] },
    async (request, reply) =>
      reply.send({
        statusCode: 200,
        data: await service.getMe(request.user.id),
      }),
  );
  fastify.post(
    "/refresh",
    { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const raw = request.cookies[config.cookieName];
      const operation = request.headers["x-refresh-operation"];
      if (!raw)
        return reply.code(401).send({
          statusCode: 401,
          message: "Session expired. Please sign in again.",
        });
      if (typeof operation !== "string" || !UUID.test(operation))
        return reply.code(400).send({
          statusCode: 400,
          message: "A refresh operation UUID is required",
        });
      // No cookie clearing on failed refresh: a delayed response must not erase a newer login.
      return respond(reply, await service.refreshAccessToken(raw, operation));
    },
  );
  fastify.post("/logout", async (request, reply) => {
    await service.logout(request.cookies[config.cookieName]);
    reply.clearCookie(config.cookieName, cookieOptions);
    return reply.send({ statusCode: 200, data: { success: true } });
  });
};
