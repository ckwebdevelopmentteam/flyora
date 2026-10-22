import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});

fastify.register(cors, {
  origin: true,
  credentials: true,
});

fastify.get("/health", async () => {
  return {
    status: "ok",
    service: "flyora-api",
    timestamp: new Date().toISOString(),
  };
});

const start = async () => {
  const port = Number(process.env.PORT) || 5000;
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Flyora Fastify API is running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
