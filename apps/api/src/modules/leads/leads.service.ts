import { FastifyInstance } from "fastify";
import { LeadFilterInput, PublicEnquiryInput } from "@flyora/validators";
import {
  LeadDetailItem,
  LeadItem,
  LeadStatus,
  PublicEnquiryResponse,
} from "@flyora/types";

export class LeadsService {
  constructor(private fastify: FastifyInstance) {}

  private formatLeadItem(lead: any): LeadItem {
    return {
      id: lead.id,
      customerId: lead.customerId,
      customer: {
        id: lead.customer.id,
        fullName: lead.customer.fullName,
        phone: lead.customer.phone,
        email: lead.customer.email,
        city: lead.customer.city,
      },
      serviceId: lead.serviceId,
      serviceName: lead.service.name,
      packageId: lead.packageId,
      packageTitle: lead.package?.title || null,
      assignedToId: lead.assignedToId,
      assignedToName: lead.assignedTo?.fullName || null,
      claimedAt: lead.claimedAt ? lead.claimedAt.toISOString() : null,
      status: lead.status,
      source: lead.source,
      travelDate: lead.travelDate ? lead.travelDate.toISOString() : null,
      numberOfAdults: lead.numberOfAdults,
      numberOfKids: lead.numberOfKids,
      estimatedBudget: lead.estimatedBudget
        ? Number(lead.estimatedBudget)
        : null,
      followUpDate: lead.followUpDate ? lead.followUpDate.toISOString() : null,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };
  }

  private formatLeadDetailItem(lead: any): LeadDetailItem {
    return {
      ...this.formatLeadItem(lead),
      activities: (lead.activities || []).map((a: any) => ({
        id: a.id,
        leadId: a.leadId,
        userId: a.userId,
        userName: a.user?.fullName || "Staff",
        action: a.action,
        details: a.details,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Submit Public Enquiry (Website form / landing pages)
   */
  async submitPublicEnquiry(
    data: PublicEnquiryInput,
  ): Promise<PublicEnquiryResponse> {
    // 1. Verify service exists
    const service = await this.fastify.prisma.service.findUnique({
      where: { id: data.serviceId },
      include: {
        coordinators: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!service) {
      throw {
        statusCode: 400,
        error: "Bad Request",
        message: "Selected service does not exist",
      };
    }

    // 2. Validate package if selected
    if (data.packageId) {
      const pkg = await this.fastify.prisma.package.findUnique({
        where: { id: data.packageId },
      });
      if (!pkg) {
        throw {
          statusCode: 400,
          error: "Bad Request",
          message: "Selected tour package does not exist",
        };
      }
    }

    // 3. Upsert Customer by unique phone number
    const customer = await this.fastify.prisma.customer.upsert({
      where: { phone: data.phone },
      update: {
        fullName: data.fullName,
        ...(data.email ? { email: data.email } : {}),
      },
      create: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
      },
    });

    // 4. Create new unassigned lead in the pool
    const lead = await this.fastify.prisma.lead.create({
      data: {
        customerId: customer.id,
        serviceId: data.serviceId,
        packageId: data.packageId || null,
        assignedToId: null, // Unassigned in Service Pool
        status: "NEW",
        source: "WEBSITE_FORM",
        travelDate: data.travelDate ? new Date(data.travelDate) : null,
        numberOfAdults: data.numberOfAdults ?? 1,
        numberOfKids: data.numberOfKids ?? 0,
      },
    });

    // 5. Coordinator phone alert notification stub
    const coordinatorPhones = service.coordinators
      .map((c) => c.user.phone)
      .filter(Boolean);

    console.log(
      `🔔 [NEW ENQUIRY ALERT] Service: "${service.name}" | Customer: ${customer.fullName} (${customer.phone}) | Alerting Coordinators: ${coordinatorPhones.join(", ") || "No phone numbers set"}`,
    );

    return {
      success: true,
      leadId: lead.id,
      customerId: customer.id,
      message:
        "Enquiry submitted successfully. A travel coordinator will contact you shortly.",
    };
  }

  /**
   * Atomic "Take Lead" (First-come, first-served claim lock)
   */
  async takeLead(leadId: string, userId: string): Promise<LeadDetailItem> {
    // Atomic update query to prevent race conditions
    const updateResult = await this.fastify.prisma.lead.updateMany({
      where: {
        id: leadId,
        assignedToId: null, // Only lock if still unclaimed!
      },
      data: {
        assignedToId: userId,
        claimedAt: new Date(),
        status: "CONTACTED",
      },
    });

    if (updateResult.count === 0) {
      // Check if lead exists and who claimed it
      const existing = await this.fastify.prisma.lead.findUnique({
        where: { id: leadId },
        include: { assignedTo: true },
      });

      if (!existing) {
        throw {
          statusCode: 404,
          error: "Not Found",
          message: "Lead not found",
        };
      }

      throw {
        statusCode: 409,
        error: "Conflict",
        message: `This lead was already claimed by ${existing.assignedTo?.fullName || "another coordinator"}.`,
      };
    }

    // Log Activity
    await this.fastify.prisma.leadActivity.create({
      data: {
        leadId,
        userId,
        action: "CLAIMED_LEAD",
        details: "Claimed lead from service pool",
      },
    });

    return this.getLeadById(leadId);
  }

  /**
   * Coordinator Service Pool: Available unclaimed leads for assigned services
   */
  async getCoordinatorLeadPool(
    userId: string,
    userRole: string,
  ): Promise<LeadItem[]> {
    let serviceFilter: any = {};

    // If not super admin or operations manager, restrict to user's assigned services
    if (userRole !== "SUPER_ADMIN" && userRole !== "OPERATIONS_MANAGER") {
      const userServices = await this.fastify.prisma.userService.findMany({
        where: { userId },
        select: { serviceId: true },
      });

      const serviceIds = userServices.map((us) => us.serviceId);
      serviceFilter = {
        serviceId: { in: serviceIds },
      };
    }

    const leads = await this.fastify.prisma.lead.findMany({
      where: {
        assignedToId: null,
        ...serviceFilter,
      },
      include: {
        customer: true,
        service: true,
        package: true,
        assignedTo: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return leads.map((l) => this.formatLeadItem(l));
  }

  /**
   * My Active Leads: Leads claimed by the current logged-in user
   */
  async getMyLeads(
    userId: string,
    status?: LeadStatus,
    search?: string,
  ): Promise<LeadItem[]> {
    const where: any = {
      assignedToId: userId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customer: { fullName: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
        { service: { name: { contains: search, mode: "insensitive" } } },
        { package: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const leads = await this.fastify.prisma.lead.findMany({
      where,
      include: {
        customer: true,
        service: true,
        package: true,
        assignedTo: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return leads.map((l) => this.formatLeadItem(l));
  }

  /**
   * Master Leads (Super Admin & Operations Manager)
   */
  async getAllLeads(filters: LeadFilterInput): Promise<{
    leads: LeadItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = {};

    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.unassignedOnly === "true") {
      where.assignedToId = null;
    }

    if (filters.search) {
      where.OR = [
        {
          customer: {
            fullName: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          customer: {
            phone: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          service: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      this.fastify.prisma.lead.findMany({
        where,
        include: {
          customer: true,
          service: true,
          package: true,
          assignedTo: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.fastify.prisma.lead.count({ where }),
    ]);

    return {
      leads: leads.map((l) => this.formatLeadItem(l)),
      total,
      page,
      limit,
    };
  }

  /**
   * Single Lead Details by ID (includes full activity log)
   */
  async getLeadById(leadId: string): Promise<LeadDetailItem> {
    const lead = await this.fastify.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        customer: true,
        service: true,
        package: true,
        assignedTo: true,
        activities: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      throw {
        statusCode: 404,
        error: "Not Found",
        message: "Lead not found",
      };
    }

    return this.formatLeadDetailItem(lead);
  }

  /**
   * Update Lead Status Stage
   */
  async updateLeadStatus(
    leadId: string,
    status: LeadStatus,
    userId: string,
  ): Promise<LeadDetailItem> {
    const existing = await this.fastify.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existing) {
      throw {
        statusCode: 404,
        error: "Not Found",
        message: "Lead not found",
      };
    }

    const previousStatus = existing.status;

    await this.fastify.prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    await this.fastify.prisma.leadActivity.create({
      data: {
        leadId,
        userId,
        action: "STATUS_CHANGE",
        details: `Stage updated from ${previousStatus} to ${status}`,
      },
    });

    return this.getLeadById(leadId);
  }

  /**
   * Add Internal Note & Optional Follow-Up Date
   */
  async addLeadNote(
    leadId: string,
    note: string,
    followUpDate: string | null | undefined,
    userId: string,
  ): Promise<LeadDetailItem> {
    const existing = await this.fastify.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existing) {
      throw {
        statusCode: 404,
        error: "Not Found",
        message: "Lead not found",
      };
    }

    if (followUpDate !== undefined) {
      await this.fastify.prisma.lead.update({
        where: { id: leadId },
        data: {
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        },
      });
    }

    await this.fastify.prisma.leadActivity.create({
      data: {
        leadId,
        userId,
        action: "NOTE_ADDED",
        details: note,
      },
    });

    return this.getLeadById(leadId);
  }

  /**
   * Manual Reassign by Admin
   */
  async reassignLead(
    leadId: string,
    targetUserId: string,
    adminUserId: string,
  ): Promise<LeadDetailItem> {
    const targetUser = await this.fastify.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw {
        statusCode: 400,
        error: "Bad Request",
        message: "Target coordinator user does not exist",
      };
    }

    const existing = await this.fastify.prisma.lead.findUnique({
      where: { id: leadId },
      include: { assignedTo: true },
    });

    if (!existing) {
      throw {
        statusCode: 404,
        error: "Not Found",
        message: "Lead not found",
      };
    }

    const previousOwner = existing.assignedTo?.fullName || "Unassigned Pool";

    await this.fastify.prisma.lead.update({
      where: { id: leadId },
      data: {
        assignedToId: targetUserId,
        claimedAt: new Date(),
      },
    });

    await this.fastify.prisma.leadActivity.create({
      data: {
        leadId,
        userId: adminUserId,
        action: "REASSIGNED_LEAD",
        details: `Reassigned from ${previousOwner} to ${targetUser.fullName} by admin`,
      },
    });

    return this.getLeadById(leadId);
  }
}
