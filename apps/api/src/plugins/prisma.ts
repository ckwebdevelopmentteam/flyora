import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { prisma } from "@flyora/database";

declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  try {
    await prisma.$connect();
    console.log("🐘 Neon PostgreSQL Database connected successfully");
  } catch (error: any) {
    console.error("❌ Failed to connect to Neon PostgreSQL:", error.message);
  }

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin, {
  name: "prisma",
});
