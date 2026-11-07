import { FastifyInstance } from "fastify";
import { CreateQuotationInput } from "@flyora/validators";
import {
  MarginCheckResult,
  PublicQuotationItem,
  PublicQuotationView,
  QuotationDetails,
  QuotationItem,
  QuoteStatus,
} from "@flyora/types";
import { randomUUID } from "node:crypto";

export function calculateQuotationMargins(
  items: QuotationItem[],
  minMarginPercent: number,
): MarginCheckResult {
  const supplierCost = items.reduce(
    (sum, item) => sum + item.supplierCost * (item.quantity || 1),
    0,
  );
  const sellingPrice = items.reduce(
    (sum, item) => sum + item.sellingPrice * (item.quantity || 1),
    0,
  );
  const marginAmount = sellingPrice - supplierCost;
  const marginPercent =
    sellingPrice > 0 ? (marginAmount / sellingPrice) * 100 : 0;
  const isHealthy = marginPercent >= minMarginPercent;

  // Calculate required price to satisfy minMarginPercent floor
  const requiredPrice =
    minMarginPercent < 100
      ? supplierCost / (1 - minMarginPercent / 100)
      : supplierCost;
  const shortfallAmount = Math.max(0, requiredPrice - sellingPrice);

  return {
    supplierCost: Math.round(supplierCost * 100) / 100,
    sellingPrice: Math.round(sellingPrice * 100) / 100,
    marginAmount: Math.round(marginAmount * 100) / 100,
    marginPercent: Math.round(marginPercent * 100) / 100,
    minMarginPercent,
    isHealthy,
    shortfallAmount: Math.round(shortfallAmount * 100) / 100,
  };
}

export class QuotationService {
  constructor(private fastify: FastifyInstance) {}

  private async generateQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.fastify.prisma.quotation.count();
    const sequence = (count + 1).toString().padStart(4, "0");
    const quoteNumber = `FLY-${year}-${sequence}`;

    // Verify uniqueness in case of race conditions
    const existing = await this.fastify.prisma.quotation.findUnique({
      where: { quoteNumber },
    });
    if (existing) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return `FLY-${year}-${randomSuffix}`;
    }
    return quoteNumber;
  }

  private formatQuotationDetails(quote: any): QuotationDetails {
    return {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      version: quote.version,
      leadId: quote.leadId,
      createdById: quote.createdById,
      createdByName: quote.createdBy?.fullName || "Staff",
      status: quote.status as QuoteStatus,
      shareToken: quote.shareToken,
      supplierCost: Number(quote.supplierCost),
      sellingPrice: Number(quote.sellingPrice),
      marginAmount: Number(quote.marginAmount),
      marginPercent: Number(quote.marginPercent),
      items: (quote.items as any[]) || [],
      inclusions: quote.inclusions || [],
      exclusions: quote.exclusions || [],
      validUntil: quote.validUntil.toISOString(),
      acceptedAt: quote.acceptedAt ? quote.acceptedAt.toISOString() : null,
      notes: quote.notes || null,
      createdAt: quote.createdAt.toISOString(),
      customer: quote.lead?.customer
        ? {
            id: quote.lead.customer.id,
            fullName: quote.lead.customer.fullName,
            phone: quote.lead.customer.phone,
            email: quote.lead.customer.email,
          }
        : undefined,
      service: quote.lead?.service
        ? {
            id: quote.lead.service.id,
            name: quote.lead.service.name,
            slug: quote.lead.service.slug,
            minMarginPercent: Number(quote.lead.service.minMarginPercent) || 10,
          }
        : undefined,
    };
  }

  /**
   * 1. Create a new quotation for a lead
   */
  async createQuotation(
    userId: string,
    userRole: string,
    input: CreateQuotationInput,
  ): Promise<QuotationDetails> {
    const lead = await this.fastify.prisma.lead.findUnique({
      where: { id: input.leadId },
      include: {
        customer: true,
        service: true,
        assignedTo: true,
      },
    });

    if (!lead) {
      const err: any = new Error("Lead not found");
      err.statusCode = 404;
      throw err;
    }

    // Role & Ownership check
    const isManagerOrAdmin =
      userRole === "SUPER_ADMIN" || userRole === "OPERATIONS_MANAGER";
    if (
      !isManagerOrAdmin &&
      lead.assignedToId &&
      lead.assignedToId !== userId
    ) {
      const err: any = new Error(
        "You do not have permission to create quotes for this lead (assigned to another coordinator)",
      );
      err.statusCode = 403;
      throw err;
    }

    // Assign items IDs if missing
    const items: QuotationItem[] = input.items.map((item) => ({
      id: item.id || randomUUID(),
      type: item.type,
      title: item.title,
      description: item.description || item.details,
      details: item.details || item.description,
      quantity: item.quantity || 1,
      supplierCost: Number(item.supplierCost),
      sellingPrice: Number(item.sellingPrice),
    }));

    const minMarginPercent = Number(lead.service.minMarginPercent) || 10;
    const margin = calculateQuotationMargins(items, minMarginPercent);
    const quoteNumber = await this.generateQuoteNumber();
    const shareToken = randomUUID();
    const validUntilDate = new Date(input.validUntil);

    const quotation = await this.fastify.prisma.$transaction(async (tx) => {
      // 1. Create quotation record
      const created = await tx.quotation.create({
        data: {
          leadId: lead.id,
          createdById: userId,
          quoteNumber,
          version: 1,
          status: "DRAFT",
          shareToken,
          supplierCost: margin.supplierCost,
          sellingPrice: margin.sellingPrice,
          marginAmount: margin.marginAmount,
          marginPercent: margin.marginPercent,
          items: items as any,
          inclusions: input.inclusions || [],
          exclusions: input.exclusions || [],
          validUntil: validUntilDate,
          notes: input.notes || null,
        },
        include: {
          lead: {
            include: {
              customer: true,
              service: true,
            },
          },
          createdBy: true,
        },
      });

      // 2. Advance lead status to QUOTED if currently NEW or CONTACTED
      if (lead.status === "NEW" || lead.status === "CONTACTED") {
        await tx.lead.update({
          where: { id: lead.id },
          data: { status: "QUOTED" },
        });
      }

      // 3. Log activity
      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          userId,
          action: "QUOTATION_CREATED",
          details: `Created quotation ${quoteNumber} for ₹${margin.sellingPrice.toLocaleString()} with margin ${margin.marginPercent.toFixed(1)}%`,
        },
      });

      return created;
    });

    return this.formatQuotationDetails(quotation);
  }

  /**
   * 2. List all quotes for a specific lead
   */
  async getQuotationsByLead(
    leadId: string,
    userId: string,
    userRole: string,
  ): Promise<QuotationDetails[]> {
    const lead = await this.fastify.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      const err: any = new Error("Lead not found");
      err.statusCode = 404;
      throw err;
    }

    const quotes = await this.fastify.prisma.quotation.findMany({
      where: { leadId },
      include: {
        lead: {
          include: {
            customer: true,
            service: true,
          },
        },
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return quotes.map((q) => this.formatQuotationDetails(q));
  }

  /**
   * 3. Get single quote by ID (Staff full view with costs & margins)
   */
  async getQuotationById(
    id: string,
    _userId: string,
    _userRole: string,
  ): Promise<QuotationDetails> {
    const quote = await this.fastify.prisma.quotation.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            customer: true,
            service: true,
          },
        },
        createdBy: true,
      },
    });

    if (!quote) {
      const err: any = new Error("Quotation not found");
      err.statusCode = 404;
      throw err;
    }

    return this.formatQuotationDetails(quote);
  }

  /**
   * 4. Public endpoint for customers to view quotation proposal via shareable token
   * STRICT SECURITY: Statically strips all supplier costs, margin amounts, and percentages.
   */
  async getPublicQuotation(shareToken: string): Promise<PublicQuotationView> {
    const quote = await this.fastify.prisma.quotation.findUnique({
      where: { shareToken },
      include: {
        lead: {
          include: {
            customer: true,
            service: true,
            assignedTo: true,
          },
        },
        createdBy: true,
      },
    });

    if (!quote) {
      const err: any = new Error("Quotation not found or link has expired");
      err.statusCode = 404;
      throw err;
    }

    const isExpired = new Date() > new Date(quote.validUntil);
    const rawItems = (quote.items as any[]) || [];

    // Strictly sanitize items: omit supplierCost
    const sanitizedItems: PublicQuotationItem[] = rawItems.map((item) => ({
      id: item.id || randomUUID(),
      type: item.type,
      title: item.title,
      description: item.description || item.details,
      quantity: item.quantity || 1,
      sellingPrice: Number(item.sellingPrice),
    }));

    const coordinator = quote.lead.assignedTo || quote.createdBy;

    return {
      quoteNumber: quote.quoteNumber,
      status: quote.status as QuoteStatus,
      shareToken: quote.shareToken,
      totalPrice: Number(quote.sellingPrice),
      items: sanitizedItems,
      inclusions: quote.inclusions || [],
      exclusions: quote.exclusions || [],
      validUntil: quote.validUntil.toISOString(),
      isExpired,
      createdAt: quote.createdAt.toISOString(),
      customerName: quote.lead.customer.fullName,
      serviceTitle: quote.lead.service.name,
      serviceSlug: quote.lead.service.slug,
      coordinator: {
        fullName: coordinator.fullName,
        phone: coordinator.phone,
      },
    };
  }

  /**
   * 5. Update quotation status (e.g. SENT, ACCEPTED, REJECTED, EXPIRED)
   */
  async updateQuotationStatus(
    id: string,
    status: QuoteStatus,
    userId: string,
    _userRole: string,
  ): Promise<QuotationDetails> {
    const quote = await this.fastify.prisma.quotation.findUnique({
      where: { id },
      include: { lead: true },
    });

    if (!quote) {
      const err: any = new Error("Quotation not found");
      err.statusCode = 404;
      throw err;
    }

    const updateData: any = { status };
    if (status === "ACCEPTED") {
      updateData.acceptedAt = new Date();
    }

    const updated = await this.fastify.prisma.$transaction(async (tx) => {
      const result = await tx.quotation.update({
        where: { id },
        data: updateData,
        include: {
          lead: {
            include: {
              customer: true,
              service: true,
            },
          },
          createdBy: true,
        },
      });

      // Log activity
      await tx.leadActivity.create({
        data: {
          leadId: quote.leadId,
          userId,
          action: "QUOTATION_STATUS_CHANGE",
          details: `Quotation ${quote.quoteNumber} marked as ${status}`,
        },
      });

      return result;
    });

    return this.formatQuotationDetails(updated);
  }
}
