export interface Lead {
  id: string;
  placeId: string | null;
  name: string;
  address: string;
  phone: string | null;
  rating: number | null;
  website: string | null;
  mapsUrl: string | null;
  source: "puppeteer" | "google" | "osm";
  approved?: boolean;
  approvedAt?: string;
  sessionId?: string;
  sessionQuery?: string;
}

export interface SessionSummary {
  id: string;
  query: string;
  type: string;
  provider: string;
  status: string;
  message: string | null;
  createdAt: string;
  completedAt: string;
  leadCount: number;
}

export interface Session extends SessionSummary {
  leads: Lead[];
}

export interface ScrapeMeta {
  scanned?: number;
  pages?: number;
  skippedDuplicate?: number;
  skippedHasWebsite?: number;
  newCount?: number;
  excludePrevious?: boolean;
  filterNoWebsite?: boolean;
}

export interface ScrapeResponse {
  success: boolean;
  session: Session;
  leads: Lead[];
  count: number;
  provider: string;
  message: string;
  targetCount: number;
  meta?: ScrapeMeta;
  usingGoogle?: boolean;
}

export interface ExtractResult {
  url: string;
  title: string | null;
  metaDescription: string | null;
  emails: string[];
  phones: string[];
  emailCount: number;
  phoneCount: number;
}
