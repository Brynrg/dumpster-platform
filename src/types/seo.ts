export type SeoTask = {
  id: string;
  created_at: string;
  market: string;
  category: "gbp" | "reviews" | "citations" | "content" | "maps";
  title: string;
  cadence: "weekly" | "monthly" | "quarterly" | "one_time" | null;
  due_date: string | null;
  status: "todo" | "doing" | "done" | "skipped";
  notes: string | null;
};

export type ReviewRequest = {
  id: string;
  created_at: string;
  market: string;
  lead_id: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  channel: "sms" | "email" | null;
  message: string | null;
  status: "draft" | "sent" | "completed" | "failed" | null;
  completed_at: string | null;
  notes: string | null;
};

export type CitationRow = {
  id: string;
  created_at: string;
  market: string;
  provider: string;
  listing_url: string | null;
  nap_name: string | null;
  nap_phone: string | null;
  nap_service_area: string | null;
  status: "todo" | "submitted" | "live" | "needs_fix" | null;
  last_verified: string | null;
  notes: string | null;
};

export type LeadOption = {
  id: string;
  created_at: string;
  region: string;
  city: string | null;
  state: string | null;
  name: string | null;
  phone: string;
  email: string | null;
};
