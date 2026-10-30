import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "@flyora/validators";
import { FastifyInstance } from "fastify";

export class ServicesService {
  constructor(private fastify: FastifyInstance) {}
  private cached?: {
    expires: number;
    data: Awaited<ReturnType<ServicesService["readServices"]>>;
  };
  private pending?: Promise<
    Awaited<ReturnType<ServicesService["readServices"]>>
  >;
  private generation = 0;
  private invalidate() {
    this.generation++;
    this.cached = undefined;
    this.pending = undefined;
  }
  async listServices(activeOnly = true) {
    if (!activeOnly) return this.readServices(false);
    if (this.cached && this.cached.expires > Date.now())
      return this.cached.data;
    if (this.pending) return this.pending;
    const generation = this.generation;
    const pending = this.readServices(true)
      .then((data) => {
        if (generation === this.generation)
          this.cached = { data, expires: Date.now() + 300_000 };
        return data;
      })
      .finally(() => {
        if (generation === this.generation) this.pending = undefined;
      });
    this.pending = pending;
    return pending;
  }
  async createService(data: CreateServiceInput) {
    const slug = data.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!slug)
      throw {
        statusCode: 400,
        message: "Use a service name containing letters or numbers.",
      };
    const service = await this.fastify.prisma.service.create({
      data: { ...data, slug },
    });
    this.invalidate();
    return service;
  }
  async updateService(id: string, data: UpdateServiceInput) {
    // Keep the URL stable when a service is renamed; existing packages and assignments retain their IDs.
    const service = await this.fastify.prisma.service.update({
      where: { id },
      data,
    });
    this.invalidate();
    return service;
  }

  private async readServices(activeOnly: boolean) {
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

    if (!service || !service.isActive) {
      throw { statusCode: 404, message: "Service not found" };
    }

    return service;
  }
}
