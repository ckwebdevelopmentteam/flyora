import { FastifyInstance } from "fastify";
import {
  BookingFilterInput,
  ConvertQuoteToBookingInput,
  RecordPaymentInput,
  VerifyPaymentInput,
} from "@flyora/validators";
import {
  BookingDetails,
  BookingStatus,
  BookingSummary,
  PaymentItem,
  PaymentMethod,
  PaymentVerificationStatus,
  PublicBookingView,
} from "@flyora/types";
import { StorageService } from "../storage/storage.service";

export class BookingsService {
  private storageService: StorageService;

  constructor(private fastify: FastifyInstance) {
    this.storageService = new StorageService();
  }

  private async generateBookingRef(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.fastify.prisma.booking.count();
    const sequence = (count + 1).toString().padStart(4, "0");
    const bookingRef = `BK-${year}-${sequence}`;

    const existing = await this.fastify.prisma.booking.findUnique({
      where: { bookingRef },
    });
    if (existing) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return `BK-${year}-${randomSuffix}`;
    }
    return bookingRef;
  }

  private formatBookingDetails(booking: any): BookingDetails {
    return {
      id: booking.id,
      bookingRef: booking.bookingRef,
      leadId: booking.leadId,
      quotationId: booking.quotationId,
      quoteNumber: booking.quotation?.quoteNumber,
      status: booking.status as BookingStatus,
      totalAmount: Number(booking.totalAmount),
      paidAmount: Number(booking.paidAmount),
      dueAmount: Number(booking.dueAmount),
      travelDate: booking.travelDate.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      customer: {
        id: booking.lead.customer.id,
        fullName: booking.lead.customer.fullName,
        phone: booking.lead.customer.phone,
        email: booking.lead.customer.email,
        city: booking.lead.customer.city,
      },
      service: {
        id: booking.lead.service.id,
        name: booking.lead.service.name,
        slug: booking.lead.service.slug,
      },
      quotation: {
        id: booking.quotation.id,
        quoteNumber: booking.quotation.quoteNumber,
        sellingPrice: Number(booking.quotation.sellingPrice),
        items: (booking.quotation.items as any[]) || [],
        inclusions: booking.quotation.inclusions || [],
        exclusions: booking.quotation.exclusions || [],
      },
      coordinator: {
        id: booking.lead.assignedTo?.id || booking.quotation.createdBy.id,
        fullName:
          booking.lead.assignedTo?.fullName ||
          booking.quotation.createdBy.fullName,
        phone:
          booking.lead.assignedTo?.phone || booking.quotation.createdBy.phone,
      },
      payments: (booking.payments || []).map((p: any) => ({
        id: p.id,
        bookingId: p.bookingId,
        recordedById: p.recordedById,
        recordedByName: p.recordedBy?.fullName || "Staff",
        amount: Number(p.amount),
        method: p.method as PaymentMethod,
        transactionRef: p.transactionRef,
        receiptFileKey: p.receiptFileKey,
        status: p.status as PaymentVerificationStatus,
        notes: p.notes,
        paymentDate: p.paymentDate.toISOString(),
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }

  /**
   * 1. 1-Click Convert Quotation to Confirmed Booking
   */
  async convertQuoteToBooking(
    userId: string,
    userRole: string,
    input: ConvertQuoteToBookingInput,
  ): Promise<BookingDetails> {
    const quotation = await this.fastify.prisma.quotation.findUnique({
      where: { id: input.quotationId },
      include: {
        lead: {
          include: {
            customer: true,
            service: true,
            assignedTo: true,
          },
        },
        booking: true,
      },
    });

    if (!quotation) {
      const err: any = new Error("Quotation not found");
      err.statusCode = 404;
      throw err;
    }

    if (quotation.booking) {
      const err: any = new Error(
        `Quotation is already converted to booking ${quotation.booking.bookingRef}`,
      );
      err.statusCode = 409;
      throw err;
    }

    // Role check
    const isManager =
      userRole === "SUPER_ADMIN" || userRole === "OPERATIONS_MANAGER";
    if (
      !isManager &&
      quotation.lead.assignedToId &&
      quotation.lead.assignedToId !== userId
    ) {
      const err: any = new Error(
        "You do not have permission to book this lead (assigned to another coordinator)",
      );
      err.statusCode = 403;
      throw err;
    }

    const bookingRef = await this.generateBookingRef();
    const travelDate = new Date(input.travelDate);
    const totalAmount = Number(quotation.sellingPrice);

    const booking = await this.fastify.prisma.$transaction(async (tx) => {
      // 1. Create confirmed booking record
      const created = await tx.booking.create({
        data: {
          bookingRef,
          leadId: quotation.leadId,
          quotationId: quotation.id,
          status: "CONFIRMED",
          totalAmount,
          paidAmount: 0,
          dueAmount: totalAmount,
          travelDate,
        },
      });

      // 2. Mark quote accepted
      await tx.quotation.update({
        where: { id: quotation.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      // 3. Mark lead BOOKED
      await tx.lead.update({
        where: { id: quotation.leadId },
        data: { status: "BOOKED" },
      });

      // 4. Log audit activity
      await tx.leadActivity.create({
        data: {
          leadId: quotation.leadId,
          userId,
          action: "BOOKING_CONFIRMED",
          details: `Confirmed booking ${bookingRef} from quote ${quotation.quoteNumber} for ₹${totalAmount.toLocaleString()}`,
        },
      });

      return created;
    });

    return this.getBookingById(booking.id, userId, userRole);
  }

  /**
   * 2. List Bookings (Filtered by role & status)
   */
  async getBookings(
    filters: BookingFilterInput,
    userId: string,
    userRole: string,
  ): Promise<{
    items: BookingSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const isManager =
      userRole === "SUPER_ADMIN" ||
      userRole === "OPERATIONS_MANAGER" ||
      userRole === "ACCOUNTS";
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.serviceId) {
      where.lead = { serviceId: filters.serviceId };
    }

    // Restrict coordinators to their assigned leads
    if (!isManager) {
      where.lead = {
        ...(where.lead || {}),
        assignedToId: userId,
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [total, bookings] = await Promise.all([
      this.fastify.prisma.booking.count({ where }),
      this.fastify.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          lead: {
            include: {
              customer: true,
              service: true,
              assignedTo: true,
            },
          },
          quotation: true,
          payments: {
            orderBy: { createdAt: "desc" },
            include: { recordedBy: true },
          },
        },
      }),
    ]);

    const items: BookingSummary[] = bookings.map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      leadId: b.leadId,
      quotationId: b.quotationId,
      quoteNumber: b.quotation?.quoteNumber,
      status: b.status as BookingStatus,
      totalAmount: Number(b.totalAmount),
      paidAmount: Number(b.paidAmount),
      dueAmount: Number(b.dueAmount),
      travelDate: b.travelDate.toISOString(),
      customerName: b.lead.customer.fullName,
      customerPhone: b.lead.customer.phone,
      serviceName: b.lead.service.name,
      serviceSlug: b.lead.service.slug,
      coordinatorName: b.lead.assignedTo?.fullName,
      payments: b.payments.map((payment) => ({
        id: payment.id,
        bookingId: payment.bookingId,
        recordedById: payment.recordedById,
        recordedByName: payment.recordedBy?.fullName,
        amount: Number(payment.amount),
        method: payment.method as PaymentMethod,
        status: payment.status as PaymentVerificationStatus,
        transactionRef: payment.transactionRef,
        receiptFileKey: payment.receiptFileKey,
        notes: payment.notes,
        paymentDate: payment.paymentDate.toISOString(),
        createdAt: payment.createdAt.toISOString(),
      })),
      createdAt: b.createdAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 3. Get single booking details with quotation and payment history
   */
  async getBookingById(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<BookingDetails> {
    const booking = await this.fastify.prisma.booking.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            customer: true,
            service: true,
            assignedTo: true,
          },
        },
        quotation: {
          include: {
            createdBy: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          include: {
            recordedBy: true,
          },
        },
      },
    });

    if (!booking) {
      const err: any = new Error("Booking not found");
      err.statusCode = 404;
      throw err;
    }

    const isManager =
      userRole === "SUPER_ADMIN" ||
      userRole === "OPERATIONS_MANAGER" ||
      userRole === "ACCOUNTS";
    if (
      !isManager &&
      booking.lead.assignedToId &&
      booking.lead.assignedToId !== userId
    ) {
      const err: any = new Error(
        "You do not have permission to view this booking",
      );
      err.statusCode = 403;
      throw err;
    }

    return this.formatBookingDetails(booking);
  }

  /**
   * 4. Public Customer Booking Trip Voucher
   */
  async getPublicBooking(bookingRef: string): Promise<PublicBookingView> {
    const booking = await this.fastify.prisma.booking.findUnique({
      where: { bookingRef },
      include: {
        lead: {
          include: {
            customer: true,
            service: true,
            assignedTo: true,
          },
        },
        quotation: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    if (!booking) {
      const err: any = new Error("Booking reference not found");
      err.statusCode = 404;
      throw err;
    }

    const quotation = booking.quotation;
    const rawItems = (quotation.items as any[]) || [];
    const coordinator = booking.lead.assignedTo || booking.quotation.createdBy;

    const itineraryItems = rawItems.map((item) => ({
      title: item.title,
      type: item.type,
      description: item.description || item.details,
      quantity: item.quantity || 1,
    }));

    const dueAmount = Number(booking.dueAmount);

    return {
      bookingRef: booking.bookingRef,
      status: booking.status as BookingStatus,
      travelDate: booking.travelDate.toISOString(),
      totalAmount: Number(booking.totalAmount),
      paidAmount: Number(booking.paidAmount),
      dueAmount,
      isFullyPaid: dueAmount <= 0,
      customerName: booking.lead.customer.fullName,
      serviceTitle: booking.lead.service.name,
      serviceSlug: booking.lead.service.slug,
      itineraryItems,
      inclusions: quotation.inclusions || [],
      exclusions: quotation.exclusions || [],
      coordinator: {
        fullName: coordinator.fullName,
        phone: coordinator.phone,
      },
      createdAt: booking.createdAt.toISOString(),
    };
  }

  /**
   * 5. Record Offline Payment (UPI, NEFT, Cash)
   */
  async recordPayment(
    userId: string,
    bookingId: string,
    input: RecordPaymentInput,
  ): Promise<PaymentItem> {
    const booking = await this.fastify.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { lead: true },
    });

    if (!booking) {
      const err: any = new Error("Booking not found");
      err.statusCode = 404;
      throw err;
    }

    const paymentDate = input.paymentDate
      ? new Date(input.paymentDate)
      : new Date();

    await this.storageService.assertReceiptExists(input.receiptFileKey);

    const payment = await this.fastify.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          bookingId: booking.id,
          recordedById: userId,
          amount: input.amount,
          method: input.method,
          transactionRef: input.transactionRef,
          receiptFileKey: input.receiptFileKey,
          status: "PENDING",
          notes: input.notes || null,
          paymentDate,
        },
        include: {
          recordedBy: true,
        },
      });

      // Log activity
      await tx.leadActivity.create({
        data: {
          leadId: booking.leadId,
          userId,
          action: "PAYMENT_RECORDED",
          details: `Recorded ${input.method} payment of ₹${Number(input.amount).toLocaleString()} (Ref: ${input.transactionRef}) - Pending Verification`,
        },
      });

      return created;
    });

    return {
      id: payment.id,
      bookingId: payment.bookingId,
      recordedById: payment.recordedById,
      recordedByName: payment.recordedBy?.fullName || "Staff",
      amount: Number(payment.amount),
      method: payment.method as PaymentMethod,
      transactionRef: payment.transactionRef,
      receiptFileKey: payment.receiptFileKey,
      status: payment.status as PaymentVerificationStatus,
      notes: payment.notes,
      paymentDate: payment.paymentDate.toISOString(),
      createdAt: payment.createdAt.toISOString(),
    };
  }

  /**
   * 6. Verify Payment (Restricted to Admin / Accounts)
   */
  async verifyPayment(
    userId: string,
    userRole: string,
    paymentId: string,
    input: VerifyPaymentInput,
  ): Promise<PaymentItem> {
    const isAccountsOrAdmin =
      userRole === "SUPER_ADMIN" ||
      userRole === "OPERATIONS_MANAGER" ||
      userRole === "ACCOUNTS";

    if (!isAccountsOrAdmin) {
      const err: any = new Error(
        "Only Admin and Accounts staff can verify offline payments",
      );
      err.statusCode = 403;
      throw err;
    }

    const payment = await this.fastify.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
        recordedBy: true,
      },
    });

    if (!payment) {
      const err: any = new Error("Payment record not found");
      err.statusCode = 404;
      throw err;
    }

    if (input.status === "VERIFIED")
      await this.storageService.assertReceiptExists(payment.receiptFileKey);

    const updatedPayment = await this.fastify.prisma.$transaction(
      async (tx) => {
        // 1. Update payment status
        const updated = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: input.status,
            notes: input.notes || payment.notes,
          },
          include: {
            recordedBy: true,
          },
        });

        // 2. Recalculate verified paid amount and remaining due
        const verifiedPayments = await tx.payment.findMany({
          where: {
            bookingId: payment.bookingId,
            status: "VERIFIED",
          },
        });

        const totalVerifiedPaid = verifiedPayments.reduce(
          (sum, p) => sum + Number(p.amount),
          0,
        );
        const totalAmount = Number(payment.booking.totalAmount);
        const dueAmount = Math.max(0, totalAmount - totalVerifiedPaid);

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            paidAmount: totalVerifiedPaid,
            dueAmount,
          },
        });

        // 3. Log activity
        await tx.leadActivity.create({
          data: {
            leadId: payment.booking.leadId,
            userId,
            action: "PAYMENT_VERIFIED",
            details: `Payment of ₹${Number(payment.amount).toLocaleString()} (${payment.method}) was marked ${input.status}`,
          },
        });

        return updated;
      },
    );

    return {
      id: updatedPayment.id,
      bookingId: updatedPayment.bookingId,
      recordedById: updatedPayment.recordedById,
      recordedByName: updatedPayment.recordedBy?.fullName || "Staff",
      amount: Number(updatedPayment.amount),
      method: updatedPayment.method as PaymentMethod,
      transactionRef: updatedPayment.transactionRef,
      receiptFileKey: updatedPayment.receiptFileKey,
      status: updatedPayment.status as PaymentVerificationStatus,
      notes: updatedPayment.notes,
      paymentDate: updatedPayment.paymentDate.toISOString(),
      createdAt: updatedPayment.createdAt.toISOString(),
    };
  }

  /**
   * Replace proof on a pending payment without changing the financial ledger.
   */
  async replacePaymentReceipt(
    paymentId: string,
    userId: string,
    userRole: string,
    receiptFileKey: string,
  ): Promise<Pick<PaymentItem, "id" | "status" | "receiptFileKey">> {
    const payment = await this.fastify.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment)
      throw Object.assign(new Error("Payment record not found"), {
        statusCode: 404,
      });
    await this.getBookingById(payment.bookingId, userId, userRole);
    if (payment.status !== "PENDING")
      throw Object.assign(
        new Error("Only pending payments can have their receipt replaced."),
        { statusCode: 409 },
      );
    await this.storageService.assertReceiptExists(receiptFileKey);
    await this.fastify.prisma.$transaction(async (tx) => {
      const changed = await tx.payment.updateMany({
        where: { id: paymentId, status: "PENDING" },
        data: { receiptFileKey },
      });
      if (changed.count !== 1)
        throw Object.assign(
          new Error(
            "The payment status changed. Refresh the booking before trying again.",
          ),
          { statusCode: 409 },
        );
      const booking = await tx.booking.findUniqueOrThrow({
        where: { id: payment.bookingId },
        select: { leadId: true },
      });
      await tx.leadActivity.create({
        data: {
          leadId: booking.leadId,
          userId,
          action: "PAYMENT_RECEIPT_UPDATED",
          details:
            "Replaced receipt proof for a pending payment; amount and verification status unchanged.",
        },
      });
    });
    return { id: paymentId, status: "PENDING", receiptFileKey };
  }

  /** Generate a fresh 15-minute private receipt download URL. */
  async getPaymentReceiptUrl(
    paymentId: string,
    userId: string,
    userRole: string,
  ): Promise<{
    downloadUrl: string;
    fileKey: string;
    expiresIn: number;
  }> {
    const payment = await this.fastify.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      const err: any = new Error("Payment record not found");
      err.statusCode = 404;
      throw err;
    }

    await this.getBookingById(payment.bookingId, userId, userRole);
    await this.storageService.assertReceiptExists(payment.receiptFileKey);
    const { downloadUrl } = await this.storageService.getPresignedDownloadUrl(
      payment.receiptFileKey,
      900,
    );

    return {
      downloadUrl,
      fileKey: payment.receiptFileKey,
      expiresIn: 900,
    };
  }
}
