import { FastifyPluginAsync } from "fastify";
import { ServicesService } from "./services.service";

export const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  const servicesService = new ServicesService(fastify);

  // GET /api/v1/services
  fastify.get("/", async (_request, reply) => {
    const services = await servicesService.listServices();
    return reply.send({
      statusCode: 200,
      data: services,
    });
  });

  // GET /api/v1/services/:slug
  fastify.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    try {
      const service = await servicesService.getServiceBySlug(slug);
      return reply.send({
        statusCode: 200,
        data: service,
      });
    } catch (err: any) {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: err.message,
      });
    }
  });
};
