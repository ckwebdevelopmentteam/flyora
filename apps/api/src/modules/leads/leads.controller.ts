import { FastifyPluginAsync } from "fastify";
import { LeadsService } from "./leads.service";
import {
  addLeadNoteSchema,
  leadFilterSchema,
  leadIdParamSchema,
  publicEnquirySchema,
  reassignLeadSchema,
  updateLeadStatusSchema,
} from "@flyora/validators";
import { requireRole } from "../../middleware/rbac";

export const leadsRoutes: FastifyPluginAsync = async (fastify) => {
  const leadsService = new LeadsService(fastify);

  // 1. POST /public/enquiry (Public endpoint for web lead capture)
  fastify.post("/public/enquiry", async (request, reply) => {
    const parseResult = publicEnquirySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          parseResult.error.errors[0]?.message || "Invalid enquiry submission",
      });
    }

    try {
      const result = await leadsService.submitPublicEnquiry(parseResult.data);
      return reply.status(201).send({
        statusCode: 201,
        data: result,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.error || "InternalServerError",
        message: err.message,
      });
    }
  });

  // 2. GET /pool (Coordinator Service Pool - Available unassigned leads)
  fastify.get(
    "/pool",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const pool = await leadsService.getCoordinatorLeadPool(
          request.user.id,
          request.user.role,
        );
        return reply.send({
          statusCode: 200,
          data: pool,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.error || "InternalServerError",
          message: err.message,
        });
      }
    },
  );

  // 3. GET /my-leads (Leads claimed by the logged-in user)
  fastify.get(
    "/my-leads",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { status, search } = request.query as {
        status?: any;
        search?: string;
      };

      try {
        const myLeads = await leadsService.getMyLeads(
          request.user.id,
          status,
          search,
        );
        return reply.send({
          statusCode: 200,
          data: myLeads,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.error || "InternalServerError",
          message: err.message,
        });
      }
    },
  );

  // 4. GET /all (Admin Master Lead Control Center)
  fastify.get(
    "/all",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const parseResult = leadFilterSchema.safeParse(request.query);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            parseResult.error.errors[0]?.message || "Invalid filter parameters",
        });
      }

      try {
        const result = await leadsService.getAllLeads(parseResult.data);
        return reply.send({
          statusCode: 200,
          data: result,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.error || "InternalServerError",
          message: err.message,
        });
      }
    },
  );

  // 5. GET /:id (Single Lead Detail with activity feed)
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = leadIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid lead ID format",
        });
      }

      try {
        const lead = await leadsService.getLeadById(paramResult.data.id);
        return reply.send({
          statusCode: 200,
          data: lead,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 404).send({
          statusCode: err.statusCode || 404,
          error: err.error || "Not Found",
          message: err.message,
        });
      }
    },
  );

  // 6. POST /:id/take (Atomic Claim Concurrency Lock)
  fastify.post(
    "/:id/take",
    {
      preHandler: [
        fastify.authenticate,
        requireRole([
          "SERVICE_COORDINATOR",
          "OPERATIONS_MANAGER",
          "SUPER_ADMIN",
        ]),
      ],
    },
    async (request, reply) => {
      const paramResult = leadIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid lead ID format",
        });
      }

      try {
        const updatedLead = await leadsService.takeLead(
          paramResult.data.id,
          request.user.id,
        );
        return reply.send({
          statusCode: 200,
          data: {
            success: true,
            lead: updatedLead,
            message: "Lead successfully claimed",
          },
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.error || "InternalServerError",
          message: err.message,
        });
      }
    },
  );

  // 7. PATCH /:id/status (Stage Transition)
  fastify.patch(
    "/:id/status",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = leadIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid lead ID format",
        });
      }

      const bodyResult = updateLeadStatusSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            bodyResult.error.errors[0]?.message || "Invalid status payload",
        });
      }

      try {
        const lead = await leadsService.updateLeadStatus(
          paramResult.data.id,
          bodyResult.data.status,
          request.user.id,
        );
        return reply.send({
          statusCode: 200,
          data: lead,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.error || "InternalServerError",
          message: err.message,
        });
      }
    },
  );

  // 8. POST /:id/notes (Internal Note + Optional Follow-Up Date)
  fastify.post(
    "/:id/notes",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = leadIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid lead ID format",
        });
      }

      const bodyResult = addLeadNoteSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            bodyResult.error.errors[0]?.message || "Invalid note payload",
        });
      }

      try {
        const lead = await leadsService.addLeadNote(
          paramResult.data.id,
          bodyResult.data.note,
          bodyResult.data.followUpDate,
          request.user.id,
        );
        return reply.status(201).send({
          statusCode: 201,
          data: lead,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.error || "InternalServerError",
          message: err.message,
        });
      }
    },
  );

  // 9. PATCH /:id/reassign (Admin manual transfer)
  fastify.patch(
    "/:id/reassign",
    {
      preHandler: [
        fastify.authenticate,
        requireRole(["SUPER_ADMIN", "OPERATIONS_MANAGER"]),
      ],
    },
    async (request, reply) => {
      const paramResult = leadIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid lead ID format",
        });
      }

      const bodyResult = reassignLeadSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            bodyResult.error.errors[0]?.message ||
            "Invalid reassignment payload",
        });
      }

      try {
        const lead = await leadsService.reassignLead(
          paramResult.data.id,
          bodyResult.data.assignedToId,
          request.user.id,
        );
        return reply.send({
          statusCode: 200,
          data: lead,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: err.error || "InternalServerError",
          message: err.message,
        });
      }
    },
  );
};

export const publicEnquiryRoutes: FastifyPluginAsync = async (fastify) => {
  const leadsService = new LeadsService(fastify);

  // POST /api/v1/public/enquiry
  fastify.post("/enquiry", async (request, reply) => {
    const parseResult = publicEnquirySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          parseResult.error.errors[0]?.message || "Invalid enquiry submission",
      });
    }

    try {
      const result = await leadsService.submitPublicEnquiry(parseResult.data);
      return reply.status(201).send({
        statusCode: 201,
        data: result,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.error || "InternalServerError",
        message: err.message,
      });
    }
  });
};
