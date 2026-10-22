import { FastifyInstance } from "fastify";
import {
  CreatePackageInput,
  PackageFilterInput,
  UpdatePackageInput,
} from "@flyora/validators";
import {
  ItineraryDay,
  PackageDetails,
  PackageSummary,
  PaginatedPackages,
} from "@flyora/types";

export class PackagesService {
  constructor(private fastify: FastifyInstance) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async listPackages(filter: PackageFilterInput): Promise<PaginatedPackages> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(50, Math.max(1, filter.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (!filter.includeUnpublished) {
      where.isPublished = true;
    }

    if (filter.featuredOnly) {
      where.isFeatured = true;
    }

    if (filter.serviceId) {
      where.serviceId = filter.serviceId;
    }

    if (filter.destination) {
      where.destination = {
        contains: filter.destination,
        mode: "insensitive",
      };
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      where.startingPrice = {};
      if (filter.minPrice !== undefined)
        where.startingPrice.gte = filter.minPrice;
      if (filter.maxPrice !== undefined)
        where.startingPrice.lte = filter.maxPrice;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: "insensitive" } },
        { destination: { contains: filter.search, mode: "insensitive" } },
        { overview: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const [packages, total] = await Promise.all([
      this.fastify.prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          service: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.fastify.prisma.package.count({ where }),
    ]);

    const items: PackageSummary[] = packages.map((p) => ({
      id: p.id,
      serviceId: p.serviceId,
      serviceName: p.service.name,
      title: p.title,
      slug: p.slug,
      durationDays: p.durationDays,
      durationNights: p.durationNights,
      destination: p.destination,
      startingPrice: Number(p.startingPrice),
      coverImageUrl: p.coverImageUrl,
      isFeatured: p.isFeatured,
      isPublished: p.isPublished,
      createdAt: p.createdAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPackageBySlug(slug: string): Promise<PackageDetails> {
    const pkg = await this.fastify.prisma.package.findUnique({
      where: { slug },
      include: {
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!pkg) {
      throw new Error("Tour package not found");
    }

    return {
      id: pkg.id,
      serviceId: pkg.serviceId,
      serviceName: pkg.service.name,
      title: pkg.title,
      slug: pkg.slug,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      destination: pkg.destination,
      startingPrice: Number(pkg.startingPrice),
      coverImageUrl: pkg.coverImageUrl,
      galleryImageUrls: pkg.galleryImageUrls,
      overview: pkg.overview,
      itinerary: (pkg.itinerary as unknown as ItineraryDay[]) || [],
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      isFeatured: pkg.isFeatured,
      isPublished: pkg.isPublished,
      metaTitle: pkg.metaTitle,
      metaDescription: pkg.metaDescription,
      keywords: pkg.keywords,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    };
  }

  async createPackage(input: CreatePackageInput): Promise<PackageDetails> {
    let slug = input.slug
      ? this.slugify(input.slug)
      : this.slugify(input.title);

    // Ensure slug is unique
    const existing = await this.fastify.prisma.package.findUnique({
      where: { slug },
    });

    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const pkg = await this.fastify.prisma.package.create({
      data: {
        serviceId: input.serviceId,
        title: input.title,
        slug,
        durationDays: input.durationDays,
        durationNights: input.durationNights,
        destination: input.destination,
        startingPrice: input.startingPrice,
        coverImageUrl: input.coverImageUrl,
        galleryImageUrls: input.galleryImageUrls || [],
        overview: input.overview,
        itinerary: input.itinerary as any,
        inclusions: input.inclusions || [],
        exclusions: input.exclusions || [],
        isFeatured: input.isFeatured || false,
        isPublished: input.isPublished ?? true,
        metaTitle: input.metaTitle || input.title,
        metaDescription: input.metaDescription || input.overview.slice(0, 155),
        keywords: input.keywords || [],
      },
      include: {
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: pkg.id,
      serviceId: pkg.serviceId,
      serviceName: pkg.service.name,
      title: pkg.title,
      slug: pkg.slug,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      destination: pkg.destination,
      startingPrice: Number(pkg.startingPrice),
      coverImageUrl: pkg.coverImageUrl,
      galleryImageUrls: pkg.galleryImageUrls,
      overview: pkg.overview,
      itinerary: (pkg.itinerary as unknown as ItineraryDay[]) || [],
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      isFeatured: pkg.isFeatured,
      isPublished: pkg.isPublished,
      metaTitle: pkg.metaTitle,
      metaDescription: pkg.metaDescription,
      keywords: pkg.keywords,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    };
  }

  async updatePackage(
    id: string,
    input: UpdatePackageInput,
  ): Promise<PackageDetails> {
    const existing = await this.fastify.prisma.package.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Tour package not found");
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      slug = this.slugify(input.slug);
      const slugConflict = await this.fastify.prisma.package.findUnique({
        where: { slug },
      });
      if (slugConflict && slugConflict.id !== id) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const pkg = await this.fastify.prisma.package.update({
      where: { id },
      data: {
        ...(input.serviceId && { serviceId: input.serviceId }),
        ...(input.title && { title: input.title }),
        ...(slug && { slug }),
        ...(input.durationDays !== undefined && {
          durationDays: input.durationDays,
        }),
        ...(input.durationNights !== undefined && {
          durationNights: input.durationNights,
        }),
        ...(input.destination && { destination: input.destination }),
        ...(input.startingPrice !== undefined && {
          startingPrice: input.startingPrice,
        }),
        ...(input.coverImageUrl && { coverImageUrl: input.coverImageUrl }),
        ...(input.galleryImageUrls && {
          galleryImageUrls: input.galleryImageUrls,
        }),
        ...(input.overview && { overview: input.overview }),
        ...(input.itinerary && { itinerary: input.itinerary as any }),
        ...(input.inclusions && { inclusions: input.inclusions }),
        ...(input.exclusions && { exclusions: input.exclusions }),
        ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        ...(input.isPublished !== undefined && {
          isPublished: input.isPublished,
        }),
        ...(input.metaTitle !== undefined && { metaTitle: input.metaTitle }),
        ...(input.metaDescription !== undefined && {
          metaDescription: input.metaDescription,
        }),
        ...(input.keywords && { keywords: input.keywords }),
      },
      include: {
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: pkg.id,
      serviceId: pkg.serviceId,
      serviceName: pkg.service.name,
      title: pkg.title,
      slug: pkg.slug,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      destination: pkg.destination,
      startingPrice: Number(pkg.startingPrice),
      coverImageUrl: pkg.coverImageUrl,
      galleryImageUrls: pkg.galleryImageUrls,
      overview: pkg.overview,
      itinerary: (pkg.itinerary as unknown as ItineraryDay[]) || [],
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      isFeatured: pkg.isFeatured,
      isPublished: pkg.isPublished,
      metaTitle: pkg.metaTitle,
      metaDescription: pkg.metaDescription,
      keywords: pkg.keywords,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    };
  }

  async deletePackage(id: string) {
    const pkg = await this.fastify.prisma.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new Error("Tour package not found");
    }

    return this.fastify.prisma.package.delete({
      where: { id },
    });
  }
}
