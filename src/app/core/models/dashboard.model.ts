/* ── Dashboard Response Models ──
   Matched exactly to backend schemas/dashboard.py */

export interface RecentCase {
  id: string;
  title: string;
  status: string;
  updated_at: string | null;
}

export interface ClientDashboard {
  total_cases: number;
  pending_cases: number;
  completed_cases: number;
  pending_payments: number;
  recent_cases: RecentCase[];
}

export interface AdvocateDashboard {
  assigned_cases: number;
  pending_reviews: number;
  completed_reviews: number;
  recent_assignments: RecentCase[];
  avg_turnaround_days: string;
  completed_this_month: number;
  client_rating: string;
}
