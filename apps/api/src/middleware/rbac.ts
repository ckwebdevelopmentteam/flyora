import { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@flyora/types";

export const requireRole = (allowedRoles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
    }
  };
};
