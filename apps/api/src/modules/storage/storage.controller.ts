import { FastifyPluginAsync } from "fastify";
import { StorageService, StorageFolder } from "./storage.service";

export const storageRoutes: FastifyPluginAsync = async (fastify) => {
  const storageService = new StorageService();

  // Support raw binary stream uploads for mock dev endpoint
  fastify.addContentTypeParser(
    ["image/jpeg", "image/png", "image/webp", "application/octet-stream"],
    (_req, _payload, done) => {
      done(null);
    },
  );

  // POST /api/v1/storage/upload-url (Authenticated staff)
  fastify.post(
    "/upload-url",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { filename, contentType, folder } =
        (request.body as {
          filename?: string;
          contentType?: string;
          folder?: StorageFolder;
        }) || {};

      if (!filename || !contentType) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "filename and contentType are required",
        });
      }

      try {
        const result = await storageService.getPresignedUploadUrl(
          filename,
          contentType,
          folder || "packages",
        );
        return reply.send({
          statusCode: 200,
          data: result,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: "InternalServerError",
          message: err.message,
        });
      }
    },
  );

  // GET /api/v1/storage/download-url (Authenticated staff)
  fastify.get(
    "/download-url",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { fileKey } = request.query as { fileKey?: string };
      if (!fileKey) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "fileKey query parameter is required",
        });
      }

      try {
        const result = await storageService.getPresignedDownloadUrl(fileKey);
        return reply.header("Cache-Control", "no-store").send({
          statusCode: 200,
          data: result,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          statusCode: err.statusCode || 500,
          error: "InternalServerError",
          message: err.message,
        });
      }
    },
  );

  // Fallback mock upload handler for dev when R2 credentials aren't set
  fastify.put("/mock-upload", async (_request, reply) => {
    return reply.send({
      statusCode: 200,
      message:
        "Mock upload successful (Configure R2 credentials in .env for production)",
    });
  });
};
