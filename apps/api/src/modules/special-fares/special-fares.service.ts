import { FastifyInstance } from "fastify";
import {
  CreateSpecialFareInput,
  SpecialFareEnquiryInput,
  SpecialFareSearchQueryInput,
  UpdateSpecialFareInput,
  UpdateSpecialFareSeatsInput,
} from "@flyora/validators";
import {
  SpecialFareAdminDetail,
  SpecialFareRoute,
  SpecialFareSummary,
} from "@flyora/types";

export class SpecialFaresService {
  constructor(private fastify: FastifyInstance) {}

  /**
   * Public: List active, non-expired special fare tickets.
   * STRICT SECURITY: Explicitly excludes supplierCost, pnrNumber, and internal notes.
   */
  async listPublicSpecialFares(
    filter: SpecialFareSearchQueryInput,
  ): Promise<{ items: SpecialFareSummary[]; total: number }> {
    const prisma = this.fastify.prisma;
    const now = new Date();

    const where: any = {
      isActive: true,
      status: "ACTIVE",
      availableSeats: { gt: 0 },
      expiresAt: { gt: now }, // Zero-maintenance auto-expiry filter
    };

    if (filter.from) {
      const fromTerm = filter.from.trim().toUpperCase();
      where.OR = [
        { originCode: fromTerm },
        { originCity: { contains: filter.from.trim(), mode: "insensitive" } },
      ];
    }

    if (filter.to) {
      const toTerm = filter.to.trim().toUpperCase();
      const destinationClause = [
        { destinationCode: toTerm },
        {
          destinationCity: { contains: filter.to.trim(), mode: "insensitive" },
        },
      ];
      if (where.OR) {
        where.AND = [{ OR: destinationClause }];
      } else {
        where.OR = destinationClause;
      }
    }

    if (filter.date) {
      const searchDate = new Date(filter.date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(searchDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        where.departureDate = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    if (filter.airline) {
      where.airlineName = {
        contains: filter.airline.trim(),
        mode: "insensitive",
      };
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      prisma.specialFareTicket.count({ where }),
      prisma.specialFareTicket.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          airlineName: true,
          airlineCode: true,
          flightNumber: true,
          originCity: true,
          originCode: true,
          destinationCity: true,
          destinationCode: true,
          departureDate: true,
          arrivalDate: true,
          flightType: true,
          baggageInfo: true,
          availableSeats: true,
          farePerSeat: true,
          expiresAt: true,
          metadata: true,
          // CRITICAL: supplierCost, pnrNumber, notes are OMITTED
        },
        orderBy: [{ displayOrder: "asc" }, { departureDate: "asc" }],
      }),
    ]);

    const items: SpecialFareSummary[] = records.map((t) => ({
      id: t.id,
      airlineName: t.airlineName,
      airlineCode: t.airlineCode,
      flightNumber: t.flightNumber,
      originCity: t.originCity,
      originCode: t.originCode,
      destinationCity: t.destinationCity,
      destinationCode: t.destinationCode,
      departureDate: t.departureDate.toISOString(),
      arrivalDate: t.arrivalDate ? t.arrivalDate.toISOString() : null,
      flightType: t.flightType as "NON_STOP" | "CONNECTING",
      baggageInfo: t.baggageInfo,
      availableSeats: t.availableSeats,
      farePerSeat: Number(t.farePerSeat),
      expiresAt: t.expiresAt.toISOString(),
      metadata: (t.metadata as Record<string, unknown>) || null,
    }));

    return { items, total };
  }

  /**
   * Public: Get aggregated routes with counts & minimum fare for sector filter pills
   */
  async listPublicRoutes(): Promise<SpecialFareRoute[]> {
    const prisma = this.fastify.prisma;
    const now = new Date();

    const activeTickets = await prisma.specialFareTicket.findMany({
      where: {
        isActive: true,
        status: "ACTIVE",
        availableSeats: { gt: 0 },
        expiresAt: { gt: now },
      },
      select: {
        originCity: true,
        originCode: true,
        destinationCity: true,
        destinationCode: true,
        farePerSeat: true,
      },
    });

    const routeMap = new Map<string, SpecialFareRoute>();

    for (const t of activeTickets) {
      const key = `${t.originCode}_${t.destinationCode}`;
      const fare = Number(t.farePerSeat);
      const existing = routeMap.get(key);

      if (!existing) {
        routeMap.set(key, {
          originCity: t.originCity,
          originCode: t.originCode,
          destinationCity: t.destinationCity,
          destinationCode: t.destinationCode,
          count: 1,
          minFare: fare,
        });
      } else {
        existing.count += 1;
        if (fare < existing.minFare) existing.minFare = fare;
      }
    }

    return Array.from(routeMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Public: Single ticket details for modal presentation
   */
  async getPublicSpecialFareById(id: string): Promise<SpecialFareSummary> {
    const prisma = this.fastify.prisma;
    const t = await prisma.specialFareTicket.findUnique({
      where: { id },
      select: {
        id: true,
        airlineName: true,
        airlineCode: true,
        flightNumber: true,
        originCity: true,
        originCode: true,
        destinationCity: true,
        destinationCode: true,
        departureDate: true,
        arrivalDate: true,
        flightType: true,
        baggageInfo: true,
        availableSeats: true,
        farePerSeat: true,
        expiresAt: true,
        metadata: true,
        isActive: true,
        status: true,
      },
    });

    if (
      !t ||
      !t.isActive ||
      t.status !== "ACTIVE" ||
      t.expiresAt <= new Date() ||
      t.availableSeats <= 0
    ) {
      throw {
        statusCode: 404,
        message: "Special fare ticket is no longer available or has expired.",
      };
    }

    return {
      id: t.id,
      airlineName: t.airlineName,
      airlineCode: t.airlineCode,
      flightNumber: t.flightNumber,
      originCity: t.originCity,
      originCode: t.originCode,
      destinationCity: t.destinationCity,
      destinationCode: t.destinationCode,
      departureDate: t.departureDate.toISOString(),
      arrivalDate: t.arrivalDate ? t.arrivalDate.toISOString() : null,
      flightType: t.flightType as "NON_STOP" | "CONNECTING",
      baggageInfo: t.baggageInfo,
      availableSeats: t.availableSeats,
      farePerSeat: Number(t.farePerSeat),
      expiresAt: t.expiresAt.toISOString(),
      metadata: (t.metadata as Record<string, unknown>) || null,
    };
  }

  /**
   * Public: Enquire & Claim a Special Fare Deal
   * Creates a customer & tagged CRM lead automatically.
   */
  async submitSpecialFareEnquiry(
    ticketId: string,
    input: SpecialFareEnquiryInput,
  ): Promise<{ success: boolean; leadId: string; message: string }> {
    const prisma = this.fastify.prisma;
    const ticket = await prisma.specialFareTicket.findUnique({
      where: { id: ticketId },
    });

    if (
      !ticket ||
      !ticket.isActive ||
      ticket.status !== "ACTIVE" ||
      ticket.expiresAt <= new Date() ||
      ticket.availableSeats <= 0
    ) {
      throw {
        statusCode: 400,
        message: "This special fare allotment has expired or sold out.",
      };
    }

    // Resolve Flight Booking service ID
    let flightService = await prisma.service.findFirst({
      where: {
        OR: [
          { slug: "flight-booking" },
          { name: { contains: "Flight", mode: "insensitive" } },
        ],
      },
    });

    if (!flightService) {
      flightService = await prisma.service.findFirst({
        where: { isActive: true },
      });
    }

    if (!flightService) {
      throw {
        statusCode: 500,
        message: "Flight service is not active in the system.",
      };
    }

    // Upsert Customer
    let customer = await prisma.customer.findFirst({
      where: { phone: input.phone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: input.fullName,
          phone: input.phone,
          email: input.email || null,
        },
      });
    } else if (input.fullName && customer.fullName !== input.fullName) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { fullName: input.fullName },
      });
    }

    const estimatedBudget = Number(ticket.farePerSeat) * input.passengerCount;
    const departureStr = ticket.departureDate.toISOString().slice(0, 10);
    const dealHeader = `[SPECIAL FARE] ${ticket.airlineName} ${ticket.flightNumber || ""} | ${ticket.originCode} ➔ ${ticket.destinationCode} (${departureStr}) | ₹${ticket.farePerSeat} x ${input.passengerCount} = ₹${estimatedBudget} | Baggage: ${ticket.baggageInfo}`;
    const fullNotes = input.notes
      ? `${dealHeader}\nClient Notes: ${input.notes}`
      : dealHeader;

    // Create Lead in CRM pool (Unassigned, ready to be claimed by flight coordinator)
    const lead = await prisma.lead.create({
      data: {
        customerId: customer.id,
        serviceId: flightService.id,
        source: "WEBSITE_FORM",
        status: "NEW",
        numberOfAdults: input.passengerCount,
        travelDate: ticket.departureDate,
        estimatedBudget,
        customerNotes: fullNotes,
      },
    });

    return {
      success: true,
      leadId: lead.id,
      message:
        "Your special fare enquiry has been confirmed. Our flight coordinator will contact you shortly to confirm your booking.",
    };
  }

  /**
   * Admin: List all special fares with supplier costs, margins, and PNR data
   */
  async listAdminSpecialFares(
    filter: SpecialFareSearchQueryInput,
  ): Promise<{ items: SpecialFareAdminDetail[]; total: number }> {
    const prisma = this.fastify.prisma;
    const where: any = {};

    if (filter.status) where.status = filter.status;
    if (filter.from) {
      where.OR = [
        { originCode: filter.from.toUpperCase() },
        { originCity: { contains: filter.from, mode: "insensitive" } },
      ];
    }
    if (filter.to) {
      const destClause = [
        { destinationCode: filter.to.toUpperCase() },
        { destinationCity: { contains: filter.to, mode: "insensitive" } },
      ];
      if (where.OR) where.AND = [{ OR: destClause }];
      else where.OR = destClause;
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      prisma.specialFareTicket.count({ where }),
      prisma.specialFareTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
      }),
    ]);

    const items: SpecialFareAdminDetail[] = records.map((t) => {
      const fare = Number(t.farePerSeat);
      const cost = t.supplierCost !== null ? Number(t.supplierCost) : null;
      const marginAmount = cost !== null ? fare - cost : null;
      const marginPercent =
        cost !== null && fare > 0 ? (marginAmount! / fare) * 100 : null;

      return {
        id: t.id,
        airlineName: t.airlineName,
        airlineCode: t.airlineCode,
        flightNumber: t.flightNumber,
        originCity: t.originCity,
        originCode: t.originCode,
        destinationCity: t.destinationCity,
        destinationCode: t.destinationCode,
        departureDate: t.departureDate.toISOString(),
        arrivalDate: t.arrivalDate ? t.arrivalDate.toISOString() : null,
        flightType: t.flightType as "NON_STOP" | "CONNECTING",
        baggageInfo: t.baggageInfo,
        totalSeats: t.totalSeats,
        availableSeats: t.availableSeats,
        farePerSeat: fare,
        supplierCost: cost,
        pnrNumber: t.pnrNumber,
        notes: t.notes,
        marginAmount:
          marginAmount !== null ? Math.round(marginAmount * 100) / 100 : null,
        marginPercent:
          marginPercent !== null ? Math.round(marginPercent * 10) / 10 : null,
        metadata: (t.metadata as Record<string, unknown>) || null,
        expiresAt: t.expiresAt.toISOString(),
        status: t.status as "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "PAUSED",
        isActive: t.isActive,
        displayOrder: t.displayOrder,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      };
    });

    return { items, total };
  }

  /**
   * Admin: Create a new special fare batch allotment
   */
  async createSpecialFare(
    input: CreateSpecialFareInput,
  ): Promise<SpecialFareAdminDetail> {
    const prisma = this.fastify.prisma;
    const departureDate = new Date(input.departureDate);

    // Default expiry: 6 hours before departure if not specified
    const expiresAt = input.expiresAt
      ? new Date(input.expiresAt)
      : new Date(departureDate.getTime() - 6 * 60 * 60 * 1000);

    const availableSeats =
      input.availableSeats !== undefined
        ? input.availableSeats
        : input.totalSeats;

    const ticket = await prisma.specialFareTicket.create({
      data: {
        airlineName: input.airlineName,
        airlineCode: input.airlineCode,
        flightNumber: input.flightNumber,
        originCity: input.originCity,
        originCode: input.originCode.toUpperCase(),
        destinationCity: input.destinationCity,
        destinationCode: input.destinationCode.toUpperCase(),
        departureDate,
        arrivalDate: input.arrivalDate ? new Date(input.arrivalDate) : null,
        flightType: input.flightType,
        baggageInfo: input.baggageInfo,
        totalSeats: input.totalSeats,
        availableSeats,
        farePerSeat: input.farePerSeat,
        supplierCost: input.supplierCost ?? null,
        pnrNumber: input.pnrNumber ?? null,
        notes: input.notes ?? null,
        metadata: input.metadata ? (input.metadata as any) : undefined,
        expiresAt,
        status: input.status,
        isActive: input.isActive,
        displayOrder: input.displayOrder,
      },
    });

    return this.getAdminSpecialFareById(ticket.id);
  }

  /**
   * Admin: Get single ticket by ID with full margins and PNR
   */
  async getAdminSpecialFareById(id: string): Promise<SpecialFareAdminDetail> {
    const prisma = this.fastify.prisma;
    const t = await prisma.specialFareTicket.findUnique({ where: { id } });

    if (!t) throw { statusCode: 404, message: "Special fare ticket not found" };

    const fare = Number(t.farePerSeat);
    const cost = t.supplierCost !== null ? Number(t.supplierCost) : null;
    const marginAmount = cost !== null ? fare - cost : null;
    const marginPercent =
      cost !== null && fare > 0 ? (marginAmount! / fare) * 100 : null;

    return {
      id: t.id,
      airlineName: t.airlineName,
      airlineCode: t.airlineCode,
      flightNumber: t.flightNumber,
      originCity: t.originCity,
      originCode: t.originCode,
      destinationCity: t.destinationCity,
      destinationCode: t.destinationCode,
      departureDate: t.departureDate.toISOString(),
      arrivalDate: t.arrivalDate ? t.arrivalDate.toISOString() : null,
      flightType: t.flightType as "NON_STOP" | "CONNECTING",
      baggageInfo: t.baggageInfo,
      totalSeats: t.totalSeats,
      availableSeats: t.availableSeats,
      farePerSeat: fare,
      supplierCost: cost,
      pnrNumber: t.pnrNumber,
      notes: t.notes,
      marginAmount:
        marginAmount !== null ? Math.round(marginAmount * 100) / 100 : null,
      marginPercent:
        marginPercent !== null ? Math.round(marginPercent * 10) / 10 : null,
      metadata: (t.metadata as Record<string, unknown>) || null,
      expiresAt: t.expiresAt.toISOString(),
      status: t.status as "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "PAUSED",
      isActive: t.isActive,
      displayOrder: t.displayOrder,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  /**
   * Admin: Update special fare details
   */
  async updateSpecialFare(
    id: string,
    input: UpdateSpecialFareInput,
  ): Promise<SpecialFareAdminDetail> {
    const prisma = this.fastify.prisma;

    const existing = await prisma.specialFareTicket.findUnique({
      where: { id },
    });
    if (!existing)
      throw { statusCode: 404, message: "Special fare ticket not found" };

    const data: any = {};
    if (input.airlineName !== undefined) data.airlineName = input.airlineName;
    if (input.airlineCode !== undefined) data.airlineCode = input.airlineCode;
    if (input.flightNumber !== undefined)
      data.flightNumber = input.flightNumber;
    if (input.originCity !== undefined) data.originCity = input.originCity;
    if (input.originCode !== undefined)
      data.originCode = input.originCode.toUpperCase();
    if (input.destinationCity !== undefined)
      data.destinationCity = input.destinationCity;
    if (input.destinationCode !== undefined)
      data.destinationCode = input.destinationCode.toUpperCase();
    if (input.departureDate !== undefined)
      data.departureDate = new Date(input.departureDate);
    if (input.arrivalDate !== undefined)
      data.arrivalDate = input.arrivalDate ? new Date(input.arrivalDate) : null;
    if (input.flightType !== undefined) data.flightType = input.flightType;
    if (input.baggageInfo !== undefined) data.baggageInfo = input.baggageInfo;
    if (input.totalSeats !== undefined) data.totalSeats = input.totalSeats;
    if (input.availableSeats !== undefined)
      data.availableSeats = input.availableSeats;
    if (input.farePerSeat !== undefined) data.farePerSeat = input.farePerSeat;
    if (input.supplierCost !== undefined)
      data.supplierCost = input.supplierCost;
    if (input.pnrNumber !== undefined) data.pnrNumber = input.pnrNumber;
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.metadata !== undefined) data.metadata = input.metadata as any;
    if (input.expiresAt !== undefined)
      data.expiresAt = new Date(input.expiresAt);
    if (input.status !== undefined) data.status = input.status;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.displayOrder !== undefined)
      data.displayOrder = input.displayOrder;

    await prisma.specialFareTicket.update({
      where: { id },
      data,
    });

    return this.getAdminSpecialFareById(id);
  }

  /**
   * Admin: 1-Click interactive seat adjustment
   */
  async updateSpecialFareSeats(
    id: string,
    input: UpdateSpecialFareSeatsInput,
  ): Promise<{ id: string; availableSeats: number; status: string }> {
    const prisma = this.fastify.prisma;
    const ticket = await prisma.specialFareTicket.findUnique({ where: { id } });

    if (!ticket)
      throw { statusCode: 404, message: "Special fare ticket not found" };

    let newSeats = ticket.availableSeats;
    if (input.change !== undefined) {
      newSeats = Math.max(
        0,
        Math.min(ticket.totalSeats, ticket.availableSeats + input.change),
      );
    } else if (input.availableSeats !== undefined) {
      newSeats = Math.max(0, Math.min(ticket.totalSeats, input.availableSeats));
    }

    let status = ticket.status;
    if (newSeats === 0) {
      status = "SOLD_OUT";
    } else if (status === "SOLD_OUT" && newSeats > 0) {
      status = "ACTIVE";
    }

    const updated = await prisma.specialFareTicket.update({
      where: { id },
      data: {
        availableSeats: newSeats,
        status,
      },
      select: {
        id: true,
        availableSeats: true,
        status: true,
      },
    });

    return updated;
  }

  /**
   * Admin: Quick visibility toggle
   */
  async toggleSpecialFareStatus(
    id: string,
  ): Promise<{ id: string; isActive: boolean }> {
    const prisma = this.fastify.prisma;
    const ticket = await prisma.specialFareTicket.findUnique({ where: { id } });

    if (!ticket)
      throw { statusCode: 404, message: "Special fare ticket not found" };

    const updated = await prisma.specialFareTicket.update({
      where: { id },
      data: { isActive: !ticket.isActive },
      select: { id: true, isActive: true },
    });

    return updated;
  }

  /**
   * Admin: Delete special fare allotment
   */
  async deleteSpecialFare(id: string): Promise<{ success: boolean }> {
    const prisma = this.fastify.prisma;
    await prisma.specialFareTicket.delete({ where: { id } });
    return { success: true };
  }
}
