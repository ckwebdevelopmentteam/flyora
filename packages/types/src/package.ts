export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string;
  stay?: string;
}

export interface PackageSummary {
  id: string;
  serviceId: string;
  serviceName: string;
  title: string;
  slug: string;
  durationDays: number;
  durationNights: number;
  destination: string;
  startingPrice: number;
  coverImageUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface PackageDetails extends PackageSummary {
  galleryImageUrls: string[];
  overview: string;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords: string[];
  updatedAt: string;
}

export interface PaginatedPackages {
  items: PackageSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
