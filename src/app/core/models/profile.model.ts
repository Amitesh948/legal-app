/* ── Profile Response Models ──
   Matched exactly to backend schemas */

export interface ClientProfile {
  user: ClientUser;
}

export interface ClientUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  profile_photo: string | null;
  status: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ClientProfileUpdate {
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
}

export interface AdvocateFullProfile {
  user: AdvocateUser;
  profile: AdvocateProfileDetail | null;
  documents: AdvocateDocument[];
}

export interface AdvocateUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  status: string | null;
  profile_photo: string | null;
}

export interface AdvocateProfileDetail {
  id: string;
  user_id: string;
  bar_council_number: string;
  bar_council_name: string;
  enrollment_date: string;
  years_of_experience: number;
  practice_type: string;
  primary_practice_areas: string[];
  secondary_practice_areas: string[] | null;
  languages_spoken: string[] | null;
  professional_summary: string | null;
  law_firm_name: string | null;
  office_address: string | null;
  office_phone: string | null;
  website: string | null;
  designation: string | null;
}

export interface AdvocateDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  status: string;
  created_at: string;
}
