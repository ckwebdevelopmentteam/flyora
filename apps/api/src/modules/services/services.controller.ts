import { createHash } from "node:crypto";
import { FastifyPluginAsync } from "fastify";
import { createServiceSchema, updateServiceSchema } from "@flyora/validators";
import { requireRole } from "../../middleware/rbac";
import { ServicesService } from "./services.service";

export const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  const servicesService = new ServicesService(fastify);
  const adminOnly = [fastify.authenticate, requireRole(["SUPER_ADMIN"])];
  fastify.get("/", async (request, reply) => {
    const services = await servicesService.listServices();
    const body = { statusCode: 200, data: services };
    const etag = `"${createHash("sha256").update(JSON.stringify(body)).digest("hex")}"`;
    // Revalidate through the API; mutations invalidate the cached database read immediately.
    reply
      .header("Cache-Control", "public, max-age=0, must-revalidate")
      .header("ETag", etag);
    if (request.headers["if-none-match"] === etag)
      return reply.code(304).send();
    return reply.send(body);
  });
  fastify.get("/manage", { preHandler: adminOnly }, async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    return { statusCode: 200, data: await servicesService.listServices(false) };
  });
  const handleWriteError = (
    error: unknown,
    reply: import("fastify").FastifyReply,
  ) => {
    const err = error as { code?: string; statusCode?: number };
    if (err.code === "P2002")
      return reply.code(409).send({
        message: "A service with this name or website address already exists.",
      });
    if (err.code === "P2025")
      return reply.code(404).send({ message: "Service not found." });
    if (err.statusCode === 400)
      return reply
        .code(400)
        .send({ message: "Use a service name containing letters or numbers." });
    throw error;
  };
  fastify.post("/", { preHandler: adminOnly }, async (request, reply) => {
    const parsed = createServiceSchema.safeParse(request.body);
    if (!parsed.success)
      return reply.code(400).send({
        message:
          parsed.error.issues[0]?.message || "Check the service details.",
      });
    try {
      return reply.code(201).send({
        statusCode: 201,
        data: await servicesService.createService(parsed.data),
      });
    } catch (error) {
      return handleWriteError(error, reply);
    }
  });
  fastify.patch("/:id", { preHandler: adminOnly }, async (request, reply) => {
    const parsed = updateServiceSchema.safeParse(request.body);
    if (!parsed.success)
      return reply.code(400).send({
        message:
          parsed.error.issues[0]?.message || "Check the service details.",
      });
    try {
      return {
        statusCode: 200,
        data: await servicesService.updateService(
          (request.params as { id: string }).id,
          parsed.data,
        ),
      };
    } catch (error) {
      return handleWriteError(error, reply);
    }
  });
  fastify.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const service = await servicesService.getServiceBySlug(slug);
    return reply.send({ statusCode: 200, data: service });
  });
};
