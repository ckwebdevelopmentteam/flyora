export type UserRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_MANAGER"
  | "SERVICE_COORDINATOR"
  | "CONTENT_MANAGER"
  | "ACCOUNTS";

export type StaffAvailability = "AVAILABLE" | "BUSY" | "OFF_DUTY";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  availability: StaffAvailability;
  isActive: boolean;
  services?: UserServiceMapping[];
  createdAt: string;
  updatedAt: string;
}

export interface UserServiceMapping {
  id: string;
  userId: string;
  serviceId: string;
  isPrimary: boolean;
  service?: ServiceSummary;
}

export interface ServiceSummary {
  id: string;
  name: string;
  slug: string;
  minMarginPercent: number;
}

export interface AuthSession {
  user: UserProfile;
  accessToken: string;
  refreshToken?: string;
}
