import type { LeadItem, LeadActivityItem, LeadStatus } from "@flyora/types";

export interface MockLeadStore {
  poolLeads: LeadItem[];
  myLeads: LeadItem[];
  activities: Record<string, LeadActivityItem[]>;
}

// Fixed UUIDs for realistic relational consistency
export const MOCK_SERVICES = {
  DUBAI: { id: "srv-dubai-001", name: "Dubai Luxury Holidays" },
  KASHMIR: { id: "srv-kashmir-002", name: "Kashmir Paradise Tours" },
  VISA: { id: "srv-visa-003", name: "Express Visa Services" },
  UMRAH: { id: "srv-umrah-004", name: "Deluxe Umrah Package" },
  EUROPE: { id: "srv-europe-005", name: "European Escapes" },
};

export const INITIAL_POOL_LEADS: LeadItem[] = [
  {
    id: "lead-pool-101",
    customerId: "cust-101",
    customer: {
      id: "cust-101",
      fullName: "Ahmed Al-Mansoor",
      phone: "+91 98451 22340",
      email: "ahmed.mansoor@example.com",
      city: "Bangalore",
    },
    serviceId: MOCK_SERVICES.DUBAI.id,
    serviceName: MOCK_SERVICES.DUBAI.name,
    packageId: "pkg-dxb-01",
    packageTitle: "5D/4N Glitz of Dubai & Desert Safari",
    assignedToId: null,
    assignedToName: null,
    claimedAt: null,
    status: "NEW",
    source: "WEBSITE_FORM",
    travelDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    numberOfAdults: 2,
    numberOfKids: 1,
    estimatedBudget: 185000,
    followUpDate: null,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(), // 12 mins ago
    updatedAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: "lead-pool-102",
    customerId: "cust-102",
    customer: {
      id: "cust-102",
      fullName: "Pooja & Rohan Sharma",
      phone: "+91 97110 55432",
      email: "rohan.sharma@example.com",
      city: "Delhi NCR",
    },
    serviceId: MOCK_SERVICES.KASHMIR.id,
    serviceName: MOCK_SERVICES.KASHMIR.name,
    packageId: "pkg-ksh-01",
    packageTitle: "6D/5N Gulmarg Gondola & Dal Lake Serenade",
    assignedToId: null,
    assignedToName: null,
    claimedAt: null,
    status: "NEW",
    source: "WHATSAPP_CLICK",
    travelDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    numberOfAdults: 2,
    numberOfKids: 0,
    estimatedBudget: 95000,
    followUpDate: null,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(), // 35 mins ago
    updatedAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: "lead-pool-103",
    customerId: "cust-103",
    customer: {
      id: "cust-103",
      fullName: "Dr. Farooq Abdullah",
      phone: "+91 98200 98765",
      email: "farooq.doc@example.com",
      city: "Mumbai",
    },
    serviceId: MOCK_SERVICES.UMRAH.id,
    serviceName: MOCK_SERVICES.UMRAH.name,
    packageId: "pkg-umr-01",
    packageTitle: "15 Days VIP Ramadan Umrah with 5★ Makkah Clock Tower",
    assignedToId: null,
    assignedToName: null,
    claimedAt: null,
    status: "NEW",
    source: "PHONE_CALL",
    travelDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    numberOfAdults: 4,
    numberOfKids: 0,
    estimatedBudget: 480000,
    followUpDate: null,
    createdAt: new Date(Date.now() - 85 * 60000).toISOString(), // 1.4 hrs ago
    updatedAt: new Date(Date.now() - 85 * 60000).toISOString(),
  },
  {
    id: "lead-pool-104",
    customerId: "cust-104",
    customer: {
      id: "cust-104",
      fullName: "Sunita Deshmukh",
      phone: "+91 99301 77654",
      email: "deshmukh.s@example.com",
      city: "Pune",
    },
    serviceId: MOCK_SERVICES.VISA.id,
    serviceName: MOCK_SERVICES.VISA.name,
    packageId: null,
    packageTitle: null,
    assignedToId: null,
    assignedToName: null,
    claimedAt: null,
    status: "NEW",
    source: "WEBSITE_FORM",
    travelDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    numberOfAdults: 1,
    numberOfKids: 0,
    estimatedBudget: 15000,
    followUpDate: null,
    createdAt: new Date(Date.now() - 140 * 60000).toISOString(), // ~2.3 hrs ago
    updatedAt: new Date(Date.now() - 140 * 60000).toISOString(),
  },
  {
    id: "lead-pool-105",
    customerId: "cust-105",
    customer: {
      id: "cust-105",
      fullName: "Vikram Singhania",
      phone: "+91 98199 44321",
      email: "vikram@singhaniagroup.in",
      city: "Kolkata",
    },
    serviceId: MOCK_SERVICES.EUROPE.id,
    serviceName: MOCK_SERVICES.EUROPE.name,
    packageId: "pkg-eur-01",
    packageTitle: "10D Swiss Alps & Paris Highlights",
    assignedToId: null,
    assignedToName: null,
    claimedAt: null,
    status: "NEW",
    source: "WEBSITE_FORM",
    travelDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    numberOfAdults: 2,
    numberOfKids: 2,
    estimatedBudget: 650000,
    followUpDate: null,
    createdAt: new Date(Date.now() - 210 * 60000).toISOString(), // 3.5 hrs ago
    updatedAt: new Date(Date.now() - 210 * 60000).toISOString(),
  },
];

export const INITIAL_MY_LEADS: LeadItem[] = [
  {
    id: "lead-my-201",
    customerId: "cust-201",
    customer: {
      id: "cust-201",
      fullName: "Imran Qureshi",
      phone: "+91 98920 11223",
      email: "imran.q@example.com",
      city: "Hyderabad",
    },
    serviceId: MOCK_SERVICES.DUBAI.id,
    serviceName: MOCK_SERVICES.DUBAI.name,
    packageId: "pkg-dxb-01",
    packageTitle: "5D/4N Glitz of Dubai & Desert Safari",
    assignedToId: "coordinator-current",
    assignedToName: "Sahil (Coordinator)",
    claimedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: "CONTACTED",
    source: "WEBSITE_FORM",
    travelDate: new Date(Date.now() + 18 * 86400000).toISOString(),
    numberOfAdults: 2,
    numberOfKids: 1,
    estimatedBudget: 210000,
    followUpDate: new Date(Date.now() + 4 * 3600000).toISOString(), // Today!
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "lead-my-202",
    customerId: "cust-202",
    customer: {
      id: "cust-202",
      fullName: "Ananya Roy",
      phone: "+91 98300 44556",
      email: "ananya.roy@example.com",
      city: "Kolkata",
    },
    serviceId: MOCK_SERVICES.KASHMIR.id,
    serviceName: MOCK_SERVICES.KASHMIR.name,
    packageId: "pkg-ksh-01",
    packageTitle: "6D/5N Gulmarg Gondola & Dal Lake Serenade",
    assignedToId: "coordinator-current",
    assignedToName: "Sahil (Coordinator)",
    claimedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    status: "QUOTED",
    source: "WHATSAPP_CLICK",
    travelDate: new Date(Date.now() + 25 * 86400000).toISOString(),
    numberOfAdults: 2,
    numberOfKids: 0,
    estimatedBudget: 110000,
    followUpDate: new Date(Date.now() + 24 * 3600000).toISOString(), // Tomorrow
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "lead-my-203",
    customerId: "cust-203",
    customer: {
      id: "cust-203",
      fullName: "Tanveer Merchant",
      phone: "+91 97690 88990",
      email: "tanveer.m@example.com",
      city: "Mumbai",
    },
    serviceId: MOCK_SERVICES.UMRAH.id,
    serviceName: MOCK_SERVICES.UMRAH.name,
    packageId: "pkg-umr-01",
    packageTitle: "15 Days VIP Ramadan Umrah with 5★ Makkah Clock Tower",
    assignedToId: "coordinator-current",
    assignedToName: "Sahil (Coordinator)",
    claimedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    status: "NEGOTIATING",
    source: "PHONE_CALL",
    travelDate: new Date(Date.now() + 40 * 86400000).toISOString(),
    numberOfAdults: 5,
    numberOfKids: 0,
    estimatedBudget: 550000,
    followUpDate: new Date(Date.now() - 2 * 3600000).toISOString(), // Overdue today
    createdAt: new Date(Date.now() - 50 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
  {
    id: "lead-my-204",
    customerId: "cust-204",
    customer: {
      id: "cust-204",
      fullName: "Siddharth Verma",
      phone: "+91 98112 33445",
      email: "sid.verma@example.com",
      city: "Gurugram",
    },
    serviceId: MOCK_SERVICES.DUBAI.id,
    serviceName: MOCK_SERVICES.DUBAI.name,
    packageId: "pkg-dxb-01",
    packageTitle: "5D/4N Glitz of Dubai & Desert Safari",
    assignedToId: "coordinator-current",
    assignedToName: "Sahil (Coordinator)",
    claimedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    status: "BOOKED",
    source: "DIRECT_WALK_IN",
    travelDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    numberOfAdults: 3,
    numberOfKids: 1,
    estimatedBudget: 320000,
    followUpDate: null,
    createdAt: new Date(Date.now() - 75 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "lead-my-205",
    customerId: "cust-205",
    customer: {
      id: "cust-205",
      fullName: "Karan Johar",
      phone: "+91 99200 12345",
      email: "karan.j@example.com",
      city: "Mumbai",
    },
    serviceId: MOCK_SERVICES.VISA.id,
    serviceName: MOCK_SERVICES.VISA.name,
    packageId: null,
    packageTitle: null,
    assignedToId: "coordinator-current",
    assignedToName: "Sahil (Coordinator)",
    claimedAt: new Date(Date.now() - 96 * 3600000).toISOString(),
    status: "LOST",
    source: "WEBSITE_FORM",
    travelDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    numberOfAdults: 1,
    numberOfKids: 0,
    estimatedBudget: 8000,
    followUpDate: null,
    createdAt: new Date(Date.now() - 100 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 3600000).toISOString(),
  },
];

export const INITIAL_LEAD_ACTIVITIES: Record<string, LeadActivityItem[]> = {
  "lead-my-201": [
    {
      id: "act-201-1",
      leadId: "lead-my-201",
      userId: "coordinator-current",
      userName: "Sahil (Coordinator)",
      action: "CLAIMED_LEAD",
      details: "Claimed lead from Dubai Luxury Holidays pool.",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "act-201-2",
      leadId: "lead-my-201",
      userId: "coordinator-current",
      userName: "Sahil (Coordinator)",
      action: "STATUS_CHANGE",
      details: "Changed status from NEW to CONTACTED.",
      createdAt: new Date(Date.now() - 1.8 * 3600000).toISOString(),
    },
    {
      id: "act-201-3",
      leadId: "lead-my-201",
      userId: "coordinator-current",
      userName: "Sahil (Coordinator)",
      action: "NOTE_ADDED",
      details:
        "Called customer via Click-to-Call. Customer wants a 4-star hotel in Downtown Dubai with private desert safari camp upgrade.",
      createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    },
  ],
  "lead-my-202": [
    {
      id: "act-202-1",
      leadId: "lead-my-202",
      userId: "coordinator-current",
      userName: "Sahil (Coordinator)",
      action: "CLAIMED_LEAD",
      details: "Claimed lead from Kashmir Paradise Tours pool.",
      createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    },
    {
      id: "act-202-2",
      leadId: "lead-my-202",
      userId: "coordinator-current",
      userName: "Sahil (Coordinator)",
      action: "STATUS_CHANGE",
      details: "Changed status from CONTACTED to QUOTED.",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: "act-202-3",
      leadId: "lead-my-202",
      userId: "coordinator-current",
      userName: "Sahil (Coordinator)",
      action: "NOTE_ADDED",
      details:
        "Sent formal itinerary quote #FLY-2026-089 via WhatsApp for ₹1,10,000 including Gulmarg Phase 2 Gondola tickets.",
      createdAt: new Date(Date.now() - 4.8 * 3600000).toISOString(),
    },
  ],
};

// In-Memory state store for Mock fallback
class MockStore {
  private pool: LeadItem[] = [...INITIAL_POOL_LEADS];
  private myLeads: LeadItem[] = [...INITIAL_MY_LEADS];
  private activities: Record<string, LeadActivityItem[]> = {
    ...INITIAL_LEAD_ACTIVITIES,
  };

  getPoolLeads(serviceId?: string): LeadItem[] {
    if (serviceId) {
      return this.pool.filter((l) => l.serviceId === serviceId);
    }
    return [...this.pool];
  }

  getMyLeads(status?: string, search?: string): LeadItem[] {
    let list = [...this.myLeads];
    if (status && status !== "ALL") {
      list = list.filter((l) => l.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.customer.fullName.toLowerCase().includes(q) ||
          l.customer.phone.includes(q) ||
          l.serviceName.toLowerCase().includes(q) ||
          (l.packageTitle && l.packageTitle.toLowerCase().includes(q)),
      );
    }
    return list;
  }

  claimLead(
    leadId: string,
    currentUser: { id: string; fullName: string },
  ): { success: boolean; lead?: LeadItem; error?: string } {
    const index = this.pool.findIndex((l) => l.id === leadId);
    if (index === -1) {
      return {
        success: false,
        error: "This lead has already been claimed by another coordinator.",
      };
    }

    const [poolLead] = this.pool.splice(index, 1);
    const claimedLead: LeadItem = {
      ...poolLead,
      assignedToId: currentUser.id,
      assignedToName: currentUser.fullName,
      claimedAt: new Date().toISOString(),
      status: "CONTACTED",
      updatedAt: new Date().toISOString(),
    };

    this.myLeads.unshift(claimedLead);

    // Initialize activities
    const actId = `act-${Date.now()}`;
    const claimActivity: LeadActivityItem = {
      id: actId,
      leadId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      action: "CLAIMED_LEAD",
      details: `Claimed lead from ${poolLead.serviceName} pool.`,
      createdAt: new Date().toISOString(),
    };
    this.activities[leadId] = [claimActivity];

    return { success: true, lead: claimedLead };
  }

  updateLeadStatus(
    leadId: string,
    status: LeadStatus,
    currentUser: { id: string; fullName: string },
  ): LeadItem {
    const lead = this.myLeads.find((l) => l.id === leadId);
    if (!lead) throw new Error("Lead not found");

    const oldStatus = lead.status;
    lead.status = status;
    lead.updatedAt = new Date().toISOString();

    const newActivity: LeadActivityItem = {
      id: `act-${Date.now()}`,
      leadId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      action: "STATUS_CHANGE",
      details: `Updated stage from ${oldStatus} to ${status}.`,
      createdAt: new Date().toISOString(),
    };

    if (!this.activities[leadId]) this.activities[leadId] = [];
    this.activities[leadId].unshift(newActivity);

    return lead;
  }

  addLeadNote(
    leadId: string,
    note: string,
    followUpDate?: string,
    currentUser?: { id: string; fullName: string },
  ): LeadActivityItem {
    const lead = this.myLeads.find((l) => l.id === leadId);
    if (lead && followUpDate !== undefined) {
      lead.followUpDate = followUpDate || null;
      lead.updatedAt = new Date().toISOString();
    }

    const newActivity: LeadActivityItem = {
      id: `act-${Date.now()}`,
      leadId,
      userId: currentUser?.id || "coordinator-current",
      userName: currentUser?.fullName || "Coordinator",
      action: "NOTE_ADDED",
      details: note,
      createdAt: new Date().toISOString(),
    };

    if (!this.activities[leadId]) this.activities[leadId] = [];
    this.activities[leadId].unshift(newActivity);

    return newActivity;
  }

  getLeadActivities(leadId: string): LeadActivityItem[] {
    return this.activities[leadId] || [];
  }
}

export const mockLeadStore = new MockStore();
