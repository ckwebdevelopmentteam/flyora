import { FastifyInstance } from "fastify";
import {
  CreatePackageInput,
  PackageFilterInput,
  UpdatePackageInput,
  UpdateShowcaseConfigInput,
} from "@flyora/validators";
import {
  ItineraryDay,
  PackageDetails,
  PackageSummary,
  PaginatedPackages,
  ShowcaseConfig,
  ShowcaseData,
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
      where.service = { isActive: true };
    }

    if (filter.featuredOnly) {
      where.isFeatured = true;
    }

    if (filter.serviceId) {
      where.serviceId = filter.serviceId;
    }

    if (filter.destinationType) where.destinationType = filter.destinationType;

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
      destinationType: p.destinationType,
      overview: p.overview,
      startingPrice: Number(p.startingPrice),
      coverImageUrl: p.coverImageUrl,
      inclusions: p.inclusions,
      isFeatured: p.isFeatured,
      featuredOrder: p.featuredOrder,
      isPopular: p.isPopular,
      popularOrder: p.popularOrder,
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

  async getPackageBySlug(
    slug: string,
    allowUnpublished = false,
  ): Promise<PackageDetails> {
    const pkg = await this.fastify.prisma.package.findUnique({
      where: { slug },
      include: {
        service: {
          select: {
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (
      !pkg ||
      (!allowUnpublished && (!pkg.isPublished || !pkg.service.isActive))
    ) {
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
      destinationType: pkg.destinationType,
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
        destinationType: input.destinationType,
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
      destinationType: pkg.destinationType,
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
        ...(input.destinationType !== undefined && {
          destinationType: input.destinationType,
        }),
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
      destinationType: pkg.destinationType,
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

  async togglePackagePublish(
    id: string,
    isPublished: boolean,
  ): Promise<PackageSummary> {
    const pkg = await this.fastify.prisma.package.update({
      where: { id },
      data: { isPublished },
      include: {
        service: {
          select: { name: true },
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
      destinationType: pkg.destinationType,
      overview: pkg.overview,
      startingPrice: Number(pkg.startingPrice),
      coverImageUrl: pkg.coverImageUrl,
      inclusions: pkg.inclusions,
      isFeatured: pkg.isFeatured,
      featuredOrder: pkg.featuredOrder,
      isPopular: pkg.isPopular,
      popularOrder: pkg.popularOrder,
      isPublished: pkg.isPublished,
      createdAt: pkg.createdAt.toISOString(),
    };
  }

  async getShowcaseData(allowUnpublished = false): Promise<ShowcaseData> {
    let config = await this.fastify.prisma.showcaseConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await this.fastify.prisma.showcaseConfig.create({
        data: {
          id: "default",
          popularTitle: "Popular packages",
          popularEyebrow: "PLAN YOUR NEXT TRIP",
          popularActive: true,
          featuredTitle: "Featured packages",
          featuredEyebrow: "FLYORA CURATED JOURNEYS",
          featuredActive: true,
        },
      });
    }

    const mapSummary = (p: any): PackageSummary => ({
      id: p.id,
      serviceId: p.serviceId,
      serviceName: p.service.name,
      title: p.title,
      slug: p.slug,
      durationDays: p.durationDays,
      durationNights: p.durationNights,
      destination: p.destination,
      destinationType: p.destinationType,
      overview: p.overview,
      startingPrice: Number(p.startingPrice),
      coverImageUrl: p.coverImageUrl,
      inclusions: p.inclusions,
      isFeatured: p.isFeatured,
      featuredOrder: p.featuredOrder,
      isPopular: p.isPopular,
      popularOrder: p.popularOrder,
      isPublished: p.isPublished,
      createdAt: p.createdAt.toISOString(),
    });

    const popularWhere: any = { isPopular: true };
    if (!allowUnpublished) {
      popularWhere.isPublished = true;
      popularWhere.service = { isActive: true };
    }

    const popular = await this.fastify.prisma.package.findMany({
      where: popularWhere,
      orderBy: [{ popularOrder: "asc" }, { createdAt: "desc" }],
      include: { service: { select: { name: true } } },
    });

    const featuredWhere: any = { isFeatured: true };
    if (!allowUnpublished) {
      featuredWhere.isPublished = true;
      featuredWhere.service = { isActive: true };
    }

    const featured = await this.fastify.prisma.package.findMany({
      where: featuredWhere,
      orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
      include: { service: { select: { name: true } } },
    });

    return {
      config: {
        id: config.id,
        popularTitle: config.popularTitle,
        popularEyebrow: config.popularEyebrow,
        popularActive: config.popularActive,
        featuredTitle: config.featuredTitle,
        featuredEyebrow: config.featuredEyebrow,
        featuredActive: config.featuredActive,
        updatedAt: config.updatedAt.toISOString(),
      },
      popular: popular.map(mapSummary),
      featured: featured.map(mapSummary),
    };
  }

  async updateShowcaseConfig(
    data: UpdateShowcaseConfigInput,
  ): Promise<ShowcaseConfig> {
    const config = await this.fastify.prisma.showcaseConfig.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        popularTitle: data.popularTitle ?? "Popular packages",
        popularEyebrow: data.popularEyebrow ?? "PLAN YOUR NEXT TRIP",
        popularActive: data.popularActive ?? true,
        featuredTitle: data.featuredTitle ?? "Featured packages",
        featuredEyebrow: data.featuredEyebrow ?? "FLYORA CURATED JOURNEYS",
        featuredActive: data.featuredActive ?? true,
      },
      update: {
        ...(data.popularTitle !== undefined && {
          popularTitle: data.popularTitle,
        }),
        ...(data.popularEyebrow !== undefined && {
          popularEyebrow: data.popularEyebrow,
        }),
        ...(data.popularActive !== undefined && {
          popularActive: data.popularActive,
        }),
        ...(data.featuredTitle !== undefined && {
          featuredTitle: data.featuredTitle,
        }),
        ...(data.featuredEyebrow !== undefined && {
          featuredEyebrow: data.featuredEyebrow,
        }),
        ...(data.featuredActive !== undefined && {
          featuredActive: data.featuredActive,
        }),
      },
    });

    return {
      id: config.id,
      popularTitle: config.popularTitle,
      popularEyebrow: config.popularEyebrow,
      popularActive: config.popularActive,
      featuredTitle: config.featuredTitle,
      featuredEyebrow: config.featuredEyebrow,
      featuredActive: config.featuredActive,
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  async reorderShowcase(
    section: "popular" | "featured",
    itemIds: string[],
  ): Promise<void> {
    await this.fastify.prisma.$transaction(
      itemIds.map((id, index) =>
        this.fastify.prisma.package.update({
          where: { id },
          data:
            section === "popular"
              ? {
                  popularOrder: index,
                  isPopular: true,
                  isFeatured: false,
                  featuredOrder: 0,
                }
              : {
                  featuredOrder: index,
                  isFeatured: true,
                  isPopular: false,
                  popularOrder: 0,
                },
        }),
      ),
    );
  }

  async togglePackageShowcase(
    packageId: string,
    section: "popular" | "featured",
    active: boolean,
  ): Promise<void> {
    if (section === "popular") {
      let popularOrder = 0;
      if (active) {
        const highest = await this.fastify.prisma.package.findFirst({
          where: { isPopular: true },
          orderBy: { popularOrder: "desc" },
          select: { popularOrder: true },
        });
        popularOrder = (highest?.popularOrder ?? -1) + 1;
      }
      await this.fastify.prisma.package.update({
        where: { id: packageId },
        data: {
          isPopular: active,
          popularOrder: active ? popularOrder : 0,
          ...(active ? { isFeatured: false, featuredOrder: 0 } : {}),
        },
      });
    } else {
      let featuredOrder = 0;
      if (active) {
        const highest = await this.fastify.prisma.package.findFirst({
          where: { isFeatured: true },
          orderBy: { featuredOrder: "desc" },
          select: { featuredOrder: true },
        });
        featuredOrder = (highest?.featuredOrder ?? -1) + 1;
      }
      await this.fastify.prisma.package.update({
        where: { id: packageId },
        data: {
          isFeatured: active,
          featuredOrder: active ? featuredOrder : 0,
          ...(active ? { isPopular: false, popularOrder: 0 } : {}),
        },
      });
    }
  }
}
