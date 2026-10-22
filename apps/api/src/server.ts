import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import prismaPlugin from "./plugins/prisma";
import jwtPlugin from "./plugins/jwt";
import { authRoutes } from "./modules/auth/auth.controller";
import { usersRoutes } from "./modules/users/users.controller";
import { servicesRoutes } from "./modules/services/services.controller";

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  },
});

// Register Core Plugins
fastify.register(cors, {
  origin: true,
  credentials: true,
});

fastify.register(prismaPlugin);
fastify.register(jwtPlugin);

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

// Global Error Handler
fastify.setErrorHandler((error: any, _request, reply) => {
  fastify.log.error(error);

  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    statusCode,
    error: error.name || "InternalServerError",
    message: error.message || "An unexpected error occurred",
  });
});

const start = async () => {
  const port = Number(process.env.PORT) || 5000;
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`🚀 Flyora Fastify API running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
