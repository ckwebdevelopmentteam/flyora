import { FastifyInstance } from "fastify";

export class ServicesService {
  constructor(private fastify: FastifyInstance) {}

  async listServices(activeOnly = true) {
    return this.fastify.prisma.service.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            coordinators: true,
            packages: true,
            leads: true,
          },
        },
      },
    });
  }

  async getServiceBySlug(slug: string) {
    const service = await this.fastify.prisma.service.findUnique({
      where: { slug },
      include: {
        coordinators: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                availability: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw new Error("Service not found");
    }

    return service;
  }
}
