import { FastifyPluginAsync } from "fastify";
import { PackagesService } from "./packages.service";
import {
  createPackageSchema,
  packageFilterSchema,
  updatePackageSchema,
} from "@flyora/validators";
import { requireRole } from "../../middleware/rbac";

export const packagesRoutes: FastifyPluginAsync = async (fastify) => {
  const packagesService = new PackagesService(fastify);

  // GET /api/v1/packages (Public list with filters)
  fastify.get("/", async (request, reply) => {
    const parseResult = packageFilterSchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          parseResult.error.errors[0]?.message || "Invalid query parameters",
      });
    }

    const result = await packagesService.listPackages(parseResult.data);
    return reply.send({
      statusCode: 200,
      data: result,
    });
  });

  // GET /api/v1/packages/:slug (Public single package details)
  fastify.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    try {
      const pkg = await packagesService.getPackageBySlug(slug);
      return reply.send({
        statusCode: 200,
        data: pkg,
      });
    } catch (err: any) {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: err.message,
      });
    }
  });

  // POST /api/v1/packages (Admin & Content Manager only)
  fastify.post(
    "/",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const parseResult = createPackageSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: parseResult.error.errors[0]?.message || "Validation error",
        });
      }

      try {
        const pkg = await packagesService.createPackage(parseResult.data);
        return reply.status(201).send({
          statusCode: 201,
          data: pkg,
        });
      } catch (err: any) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: err.message,
        });
      }
    },
  );

  // PUT /api/v1/packages/:id (Admin & Content Manager only)
  fastify.put(
    "/:id",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parseResult = updatePackageSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: parseResult.error.errors[0]?.message || "Validation error",
        });
      }

      try {
        const pkg = await packagesService.updatePackage(id, parseResult.data);
        return reply.send({
          statusCode: 200,
          data: pkg,
        });
      } catch (err: any) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: err.message,
        });
      }
    },
  );

  // DELETE /api/v1/packages/:id (Admin only)
  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate, requireRole(["SUPER_ADMIN"])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        await packagesService.deletePackage(id);
        return reply.send({
          statusCode: 200,
          message: "Package deleted successfully",
        });
      } catch (err: any) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: err.message,
        });
      }
    },
  );
};
