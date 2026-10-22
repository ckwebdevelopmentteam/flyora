import { FastifyPluginAsync } from "fastify";
import { UsersService } from "./users.service";
import { createUserSchema } from "@flyora/validators";
import { requireRole } from "../../middleware/rbac";
import { StaffAvailability } from "@flyora/types";

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  const usersService = new UsersService(fastify);

  // GET /api/v1/users (Admin / Manager only)
  fastify.get(
    "/",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "OPERATIONS_MANAGER"]),
      ],
    },
    async (_request, reply) => {
      const users = await usersService.listUsers();
      return reply.send({
        statusCode: 200,
        data: users,
      });
    },
  );

  // POST /api/v1/users (Super Admin only)
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, requireRole(["SUPER_ADMIN"])],
    },
    async (request, reply) => {
      const parseResult = createUserSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: parseResult.error.errors[0]?.message || "Validation error",
        });
      }

      try {
        const newUser = await usersService.createUser(parseResult.data);
        return reply.status(201).send({
          statusCode: 201,
          data: newUser,
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

  // PATCH /api/v1/users/:id/services (Assign or update coordinator services)
  fastify.patch(
    "/:id/services",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { serviceIds, primaryServiceId } = request.body as {
        serviceIds: string[];
        primaryServiceId?: string;
      };

      try {
        const updated = await usersService.updateUserServices(
          id,
          serviceIds || [],
          primaryServiceId,
        );
        return reply.send({
          statusCode: 200,
          data: updated,
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

  // PATCH /api/v1/users/:id/availability (Toggle Available / Busy / Off-Duty)
  fastify.patch(
    "/:id/availability",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { availability } = request.body as {
        availability: StaffAvailability;
      };

      // Ensure user is updating their own availability, unless Admin/Manager
      if (
        request.user.id !== id &&
        !["SUPER_ADMIN", "OPERATIONS_MANAGER"].includes(request.user.role)
      ) {
        return reply.status(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You can only update your own availability",
        });
      }

      try {
        const updated = await usersService.updateAvailability(id, availability);
        return reply.send({
          statusCode: 200,
          data: updated,
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
