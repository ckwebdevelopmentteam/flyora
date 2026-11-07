import { FastifyPluginAsync } from "fastify";
import { QuotationService } from "./quotation.service";
import {
  createQuotationSchema,
  updateQuotationStatusSchema,
} from "@flyora/validators";
import { z } from "zod";

const quoteIdParamSchema = z.object({
  id: z.string().uuid("Invalid quotation ID"),
});

const leadIdParamSchema = z.object({
  leadId: z.string().uuid("Invalid lead ID"),
});

const shareTokenParamSchema = z.object({
  shareToken: z.string().min(1, "Share token is required"),
});

export const quotationRoutes: FastifyPluginAsync = async (fastify) => {
  const quotationService = new QuotationService(fastify);

  // 1. POST /api/v1/quotes — Create quotation (Staff/Admin)
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const parseResult = createQuotationSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            parseResult.error.errors[0]?.message || "Invalid quotation data",
        });
      }

      try {
        const quote = await quotationService.createQuotation(
          request.user.id,
          request.user.role,
          parseResult.data,
        );
        return reply.status(201).send({
          statusCode: 201,
          data: quote,
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

  // 2. GET /api/v1/quotes/lead/:leadId — List quotes for a specific lead (Staff/Admin)
  fastify.get(
    "/lead/:leadId",
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
        const quotes = await quotationService.getQuotationsByLead(
          paramResult.data.leadId,
          request.user.id,
          request.user.role,
        );
        return reply.send({
          statusCode: 200,
          data: quotes,
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

  // 3. GET /api/v1/quotes/:id — Single quotation detail (Staff/Admin)
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = quoteIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid quotation ID format",
        });
      }

      try {
        const quote = await quotationService.getQuotationById(
          paramResult.data.id,
          request.user.id,
          request.user.role,
        );
        return reply.send({
          statusCode: 200,
          data: quote,
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

  // 4. PATCH /api/v1/quotes/:id/status — Update quotation status (Staff/Admin)
  fastify.patch(
    "/:id/status",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = quoteIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid quotation ID format",
        });
      }

      const bodyResult = updateQuotationStatusSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            bodyResult.error.errors[0]?.message || "Invalid quotation status",
        });
      }

      try {
        const updated = await quotationService.updateQuotationStatus(
          paramResult.data.id,
          bodyResult.data.status,
          request.user.id,
          request.user.role,
        );
        return reply.send({
          statusCode: 200,
          data: updated,
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

// Public Routes (Rate-limited, unauthenticated, strictly sanitized customer proposal)
export const publicQuotationRoutes: FastifyPluginAsync = async (fastify) => {
  const quotationService = new QuotationService(fastify);

  // GET /api/v1/public/quotes/:shareToken
  fastify.get(
    "/quotes/:shareToken",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const paramResult = shareTokenParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid share token",
        });
      }

      try {
        const publicQuote = await quotationService.getPublicQuotation(
          paramResult.data.shareToken,
        );
        return reply.send({
          statusCode: 200,
          data: publicQuote,
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
