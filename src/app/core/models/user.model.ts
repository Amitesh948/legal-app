export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  role_id: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  otp_code: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface OtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp_code: string;
}
