import type {
  CreateServiceInput,
  ReorderServicesInput,
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
    const service = await this.fastify.prisma.$transaction(
      async (tx) => {
        const last = await tx.service.aggregate({
          _max: { displayOrder: true },
        });
        return tx.service.create({
          data: {
            ...data,
            slug,
            displayOrder: (last._max.displayOrder ?? -1) + 1,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
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

  async reorderServices({
    serviceIds,
    expectedServiceIds,
  }: ReorderServicesInput) {
    await this.fastify.prisma.$transaction(
      async (tx) => {
        const current = await tx.service.findMany({
          select: { id: true },
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "asc" },
            { id: "asc" },
          ],
        });
        const currentIds = current.map((service) => service.id);
        const supplied = new Set(serviceIds);
        if (
          currentIds.length !== supplied.size ||
          currentIds.some(
            (id, index) =>
              !supplied.has(id) || id !== expectedServiceIds[index],
          ) ||
          expectedServiceIds.length !== currentIds.length
        ) {
          throw { statusCode: 409, error: "SERVICE_ORDER_CHANGED" };
        }
        // A single transaction prevents partially saved orders and rejects concurrent edits.
        for (const [displayOrder, id] of serviceIds.entries()) {
          await tx.service.update({ where: { id }, data: { displayOrder } });
        }
      },
      { isolationLevel: "Serializable" },
    );
    this.invalidate();
  }

  private async readServices(activeOnly: boolean) {
    return this.fastify.prisma.service.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
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
