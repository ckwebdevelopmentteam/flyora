import { FastifyPluginAsync } from "fastify";
import { BookingsService } from "./bookings.service";
import {
  bookingFilterSchema,
  convertQuoteToBookingSchema,
  recordPaymentSchema,
  verifyPaymentSchema,
} from "@flyora/validators";
import { z } from "zod";

const bookingIdParamSchema = z.object({
  id: z.string().uuid("Invalid booking ID"),
});

const paymentIdParamSchema = z.object({
  id: z.string().uuid("Invalid payment ID"),
});

const bookingRefParamSchema = z.object({
  bookingRef: z.string().min(3, "Invalid booking reference"),
});

export const bookingsRoutes: FastifyPluginAsync = async (fastify) => {
  const bookingsService = new BookingsService(fastify);

  // 1. POST /api/v1/bookings/convert-quote — 1-Click Convert Quote to Confirmed Booking
  fastify.post(
    "/convert-quote",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const parseResult = convertQuoteToBookingSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            parseResult.error.errors[0]?.message || "Invalid conversion data",
        });
      }

      try {
        const booking = await bookingsService.convertQuoteToBooking(
          request.user.id,
          request.user.role,
          parseResult.data,
        );
        return reply.status(201).send({
          statusCode: 201,
          data: booking,
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

  // 2. GET /api/v1/bookings — List Bookings
  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const filterResult = bookingFilterSchema.safeParse(request.query);
      if (!filterResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid booking query parameters",
        });
      }

      try {
        const result = await bookingsService.getBookings(
          filterResult.data,
          request.user.id,
          request.user.role,
        );
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

  // 3. GET /api/v1/bookings/:id — Single Booking Details
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = bookingIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid booking ID",
        });
      }

      try {
        const booking = await bookingsService.getBookingById(
          paramResult.data.id,
          request.user.id,
          request.user.role,
        );
        return reply.send({
          statusCode: 200,
          data: booking,
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

  // 4. POST /api/v1/bookings/:id/payments — Record Offline Payment
  fastify.post(
    "/:id/payments",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = bookingIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid booking ID",
        });
      }

      const bodyResult = recordPaymentSchema.safeParse({
        ...(request.body as object),
        bookingId: paramResult.data.id,
      });

      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            bodyResult.error.errors[0]?.message || "Invalid payment data",
        });
      }

      try {
        const payment = await bookingsService.recordPayment(
          request.user.id,
          paramResult.data.id,
          bodyResult.data,
        );
        return reply.status(201).send({
          statusCode: 201,
          data: payment,
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

// Payment Management Routes (Verification & Receipt Download)
export const paymentsRoutes: FastifyPluginAsync = async (fastify) => {
  const bookingsService = new BookingsService(fastify);

  // 5. PATCH /api/v1/payments/:id/verify — Verify or Reject Payment (Admin/Accounts only)
  fastify.patch(
    "/:id/verify",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = paymentIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid payment ID",
        });
      }

      const bodyResult = verifyPaymentSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            bodyResult.error.errors[0]?.message ||
            "Invalid verification status",
        });
      }

      try {
        const verified = await bookingsService.verifyPayment(
          request.user.id,
          request.user.role,
          paramResult.data.id,
          bodyResult.data,
        );
        return reply.send({
          statusCode: 200,
          data: verified,
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

  // 6. GET /api/v1/payments/:id/receipt-url — 15-Minute Presigned Download URL
  fastify.get(
    "/:id/receipt-url",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const paramResult = paymentIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid payment ID",
        });
      }

      try {
        const result = await bookingsService.getPaymentReceiptUrl(
          paramResult.data.id,
        );
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
};

// Public Routes (Customer Booking Voucher)
export const publicBookingsRoutes: FastifyPluginAsync = async (fastify) => {
  const bookingsService = new BookingsService(fastify);

  // 7. GET /api/v1/public/bookings/:bookingRef
  fastify.get(
    "/bookings/:bookingRef",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const paramResult = bookingRefParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid booking reference",
        });
      }

      try {
        const voucher = await bookingsService.getPublicBooking(
          paramResult.data.bookingRef,
        );
        return reply.send({
          statusCode: 200,
          data: voucher,
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
