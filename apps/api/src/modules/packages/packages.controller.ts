import { FastifyPluginAsync } from "fastify";
import { PackagesService } from "./packages.service";
import {
  createPackageSchema,
  packageFilterSchema,
  reorderShowcaseSchema,
  togglePackageShowcaseSchema,
  updatePackageSchema,
  updateShowcaseConfigSchema,
} from "@flyora/validators";
import { requireRole } from "../../middleware/rbac";
import { z } from "zod";

export const packagesRoutes: FastifyPluginAsync = async (fastify) => {
  const packagesService = new PackagesService(fastify);

  // GET /api/v1/packages/showcase (Curated Showcase: Popular & Featured + Config)
  fastify.get("/showcase", async (request, reply) => {
    let allowUnpublished = false;
    if (request.headers.authorization) {
      try {
        await fastify.authenticate(request, reply);
        if (!reply.sent && request.user) {
          allowUnpublished = [
            "SUPER_ADMIN",
            "CONTENT_MANAGER",
            "OPERATIONS_MANAGER",
          ].includes(request.user.role);
        }
      } catch {
        // Public fallback
      }
    }
    const showcase = await packagesService.getShowcaseData(allowUnpublished);
    return reply.send({
      statusCode: 200,
      data: showcase,
    });
  });

  // PUT /api/v1/packages/showcase/config (Admin only)
  fastify.put(
    "/showcase/config",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const parseResult = updateShowcaseConfigSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: parseResult.error.errors[0]?.message || "Validation error",
        });
      }
      const updated = await packagesService.updateShowcaseConfig(
        parseResult.data,
      );
      return reply.send({
        statusCode: 200,
        data: updated,
      });
    },
  );

  // PUT /api/v1/packages/showcase/reorder (Admin only)
  fastify.put(
    "/showcase/reorder",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const parseResult = reorderShowcaseSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: parseResult.error.errors[0]?.message || "Validation error",
        });
      }
      await packagesService.reorderShowcase(
        parseResult.data.section,
        parseResult.data.itemIds,
      );
      return reply.send({
        statusCode: 200,
        message: "Showcase order updated successfully",
      });
    },
  );

  // PUT /api/v1/packages/showcase/toggle (Admin only: add/remove package in section)
  fastify.put(
    "/showcase/toggle",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const parseResult = togglePackageShowcaseSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: parseResult.error.errors[0]?.message || "Validation error",
        });
      }
      await packagesService.togglePackageShowcase(
        parseResult.data.packageId,
        parseResult.data.section,
        parseResult.data.active,
      );
      return reply.send({
        statusCode: 200,
        message: "Package showcase status updated successfully",
      });
    },
  );

  // PATCH /api/v1/packages/:id/publish (Admin only: hide/unhide package)
  fastify.patch(
    "/:id/publish",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const bodySchema = z.object({ isPublished: z.boolean() });
      const parseResult = bodySchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "isPublished boolean is required",
        });
      }
      const updated = await packagesService.togglePackagePublish(
        id,
        parseResult.data.isPublished,
      );
      return reply.send({
        statusCode: 200,
        data: updated,
      });
    },
  );

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

    if (parseResult.data.includeUnpublished) {
      await fastify.authenticate(request, reply);
      if (reply.sent) return;
      await requireRole([
        "SUPER_ADMIN",
        "CONTENT_MANAGER",
        "OPERATIONS_MANAGER",
      ])(request, reply);
      if (reply.sent) return;
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
      let allowUnpublished = false;
      if (request.headers.authorization) {
        await fastify.authenticate(request, reply);
        if (reply.sent) return;
        allowUnpublished = [
          "SUPER_ADMIN",
          "CONTENT_MANAGER",
          "OPERATIONS_MANAGER",
        ].includes(request.user.role);
      }
      const pkg = await packagesService.getPackageBySlug(
        slug,
        allowUnpublished,
      );
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
