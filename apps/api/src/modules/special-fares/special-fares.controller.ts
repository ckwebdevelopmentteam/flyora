import { FastifyPluginAsync } from "fastify";
import { SpecialFaresService } from "./special-fares.service";
import {
  createSpecialFareSchema,
  specialFareEnquirySchema,
  specialFareSearchQuerySchema,
  updateSpecialFareSchema,
  updateSpecialFareSeatsSchema,
} from "@flyora/validators";
import { requireRole } from "../../middleware/rbac";

/**
 * Public Routes: /api/v1/public/special-fares
 * Read-only access to active, non-expired deals & public enquiry submissions.
 */
export const publicSpecialFaresRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new SpecialFaresService(fastify);

  // GET /api/v1/public/special-fares
  fastify.get("/", async (request, reply) => {
    const parseResult = specialFareSearchQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          parseResult.error.errors[0]?.message || "Invalid query parameters",
      });
    }

    const result = await service.listPublicSpecialFares(parseResult.data);
    return reply.send({
      statusCode: 200,
      data: result.items,
      total: result.total,
    });
  });

  // GET /api/v1/public/special-fares/routes (Aggregated route list for filter pills)
  fastify.get("/routes", async (_request, reply) => {
    const routes = await service.listPublicRoutes();
    return reply.send({
      statusCode: 200,
      data: routes,
    });
  });

  // GET /api/v1/public/special-fares/:id
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const ticket = await service.getPublicSpecialFareById(id);
      return reply.send({
        statusCode: 200,
        data: ticket,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? "Not Found" : "Internal Server Error",
        message: err.message,
      });
    }
  });

  // POST /api/v1/public/special-fares/:id/enquire (Claim a special fare seat)
  fastify.post("/:id/enquire", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = specialFareEnquirySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          parseResult.error.errors[0]?.message || "Invalid enquiry details",
      });
    }

    try {
      const result = await service.submitSpecialFareEnquiry(
        id,
        parseResult.data,
      );
      return reply.status(201).send({
        statusCode: 201,
        data: result,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 400 ? "Bad Request" : "Internal Server Error",
        message: err.message,
      });
    }
  });
};

/**
 * Admin Routes: /api/v1/admin/special-fares
 * Full inventory management, 1-click seat adjustment, PNR references, and margins.
 */
export const adminSpecialFaresRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new SpecialFaresService(fastify);

  // Global auth preHandler for all admin routes in this plugin
  fastify.addHook("preHandler", fastify.authenticate);

  // GET /api/v1/admin/special-fares (List all allotments with margins & PNR)
  fastify.get(
    "/",
    {
      preHandler: [
        requireRole([
          "SUPER_ADMIN",
          "OPERATIONS_MANAGER",
          "SERVICE_COORDINATOR",
        ]),
      ],
    },
    async (request, reply) => {
      const parseResult = specialFareSearchQuerySchema.safeParse(request.query);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            parseResult.error.errors[0]?.message || "Invalid query parameters",
        });
      }

      const result = await service.listAdminSpecialFares(parseResult.data);
      return reply.send({
        statusCode: 200,
        data: result.items,
        total: result.total,
      });
    },
  );

  // GET /api/v1/admin/special-fares/:id
  fastify.get(
    "/:id",
    {
      preHandler: [
        requireRole([
          "SUPER_ADMIN",
          "OPERATIONS_MANAGER",
          "SERVICE_COORDINATOR",
        ]),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const ticket = await service.getAdminSpecialFareById(id);
        return reply.send({
          statusCode: 200,
          data: ticket,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.statusCode === 404 ? "Not Found" : "Internal Server Error",
          message: err.message,
        });
      }
    },
  );

  // POST /api/v1/admin/special-fares (Create batch allotment)
  fastify.post(
    "/",
    {
      preHandler: [requireRole(["SUPER_ADMIN", "OPERATIONS_MANAGER"])],
    },
    async (request, reply) => {
      const parseResult = createSpecialFareSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            parseResult.error.errors[0]?.message || "Invalid allotment details",
        });
      }

      try {
        const created = await service.createSpecialFare(parseResult.data);
        return reply.status(201).send({
          statusCode: 201,
          data: created,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: "Internal Server Error",
          message: err.message,
        });
      }
    },
  );

  // PUT /api/v1/admin/special-fares/:id (Edit allotment)
  fastify.put(
    "/:id",
    {
      preHandler: [requireRole(["SUPER_ADMIN", "OPERATIONS_MANAGER"])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parseResult = updateSpecialFareSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            parseResult.error.errors[0]?.message || "Invalid update data",
        });
      }

      try {
        const updated = await service.updateSpecialFare(id, parseResult.data);
        return reply.send({
          statusCode: 200,
          data: updated,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.statusCode === 404 ? "Not Found" : "Internal Server Error",
          message: err.message,
        });
      }
    },
  );

  // PATCH /api/v1/admin/special-fares/:id/seats (1-Click interactive seat adjustment)
  fastify.patch(
    "/:id/seats",
    {
      preHandler: [
        requireRole([
          "SUPER_ADMIN",
          "OPERATIONS_MANAGER",
          "SERVICE_COORDINATOR",
        ]),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parseResult = updateSpecialFareSeatsSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            parseResult.error.errors[0]?.message ||
            "Invalid seat adjustment data",
        });
      }

      try {
        const result = await service.updateSpecialFareSeats(
          id,
          parseResult.data,
        );
        return reply.send({
          statusCode: 200,
          data: result,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.statusCode === 404 ? "Not Found" : "Internal Server Error",
          message: err.message,
        });
      }
    },
  );

  // PATCH /api/v1/admin/special-fares/:id/toggle (Visibility toggle)
  fastify.patch(
    "/:id/toggle",
    {
      preHandler: [requireRole(["SUPER_ADMIN", "OPERATIONS_MANAGER"])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const result = await service.toggleSpecialFareStatus(id);
        return reply.send({
          statusCode: 200,
          data: result,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.statusCode === 404 ? "Not Found" : "Internal Server Error",
          message: err.message,
        });
      }
    },
  );

  // DELETE /api/v1/admin/special-fares/:id
  fastify.delete(
    "/:id",
    {
      preHandler: [requireRole(["SUPER_ADMIN"])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const result = await service.deleteSpecialFare(id);
        return reply.send({
          statusCode: 200,
          data: result,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.statusCode === 404 ? "Not Found" : "Internal Server Error",
          message: err.message,
        });
      }
    },
  );
};
