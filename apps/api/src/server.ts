import "./environment";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { authConfig } from "./modules/auth/auth.config";
import prismaPlugin from "./plugins/prisma";
import jwtPlugin from "./plugins/jwt";
import { authRoutes } from "./modules/auth/auth.controller";
import { usersRoutes } from "./modules/users/users.controller";
import { servicesRoutes } from "./modules/services/services.controller";
import { packagesRoutes } from "./modules/packages/packages.controller";
import { storageRoutes } from "./modules/storage/storage.controller";
import {
  leadsRoutes,
  publicEnquiryRoutes,
} from "./modules/leads/leads.controller";
import {
  quotationRoutes,
  publicQuotationRoutes,
} from "./modules/quotation/quotation.controller";
import {
  bookingsRoutes,
  paymentsRoutes,
  publicBookingsRoutes,
} from "./modules/bookings/bookings.controller";

const fastify = Fastify({
  logger: {
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
    ],
    level: process.env.LOG_LEVEL || "warn",
  },
});

// Register Core Plugins
fastify.register(cors, {
  origin: authConfig().origins,
  credentials: true,
});

fastify.register(cookie);
fastify.register(rateLimit, { global: false });
fastify.register(prismaPlugin);
fastify.register(jwtPlugin);

// Root welcome endpoint
fastify.get("/", async () => {
  return {
    status: "ok",
    service: "flyora-api",
    version: "0.1.0",
    message: "Flyora Travels Fastify API is active",
    health: "/health",
    timestamp: new Date().toISOString(),
  };
});

// Health check endpoint
fastify.get("/health", async () => {
  return {
    status: "ok",
    service: "flyora-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  };
});

// Register Module Routes
fastify.register(authRoutes, { prefix: "/api/v1/auth" });
fastify.register(usersRoutes, { prefix: "/api/v1/users" });
fastify.register(servicesRoutes, { prefix: "/api/v1/services" });
fastify.register(packagesRoutes, { prefix: "/api/v1/packages" });
fastify.register(storageRoutes, { prefix: "/api/v1/storage" });
fastify.register(leadsRoutes, { prefix: "/api/v1/leads" });
fastify.register(publicEnquiryRoutes, { prefix: "/api/v1/public" });
fastify.register(quotationRoutes, { prefix: "/api/v1/quotes" });
fastify.register(publicQuotationRoutes, { prefix: "/api/v1/public" });
fastify.register(bookingsRoutes, { prefix: "/api/v1/bookings" });
fastify.register(paymentsRoutes, { prefix: "/api/v1/payments" });
fastify.register(publicBookingsRoutes, { prefix: "/api/v1/public" });

// Global Error Handler
fastify.setErrorHandler((error: any, _request, reply) => {
  if ((error.statusCode || 500) >= 500)
    fastify.log.error({ errorName: error.name }, "Request failed");

  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    statusCode,
    error: error.name || "InternalServerError",
    message: statusCode >= 500 ? "An unexpected error occurred" : error.message,
  });
});

const start = async () => {
  const port = Number(process.env.PORT) || 5000;
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Flyora Fastify API running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
