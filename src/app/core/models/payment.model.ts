export type PaymentStatus = 
  | 'PENDING' 
  | 'CREATED' 
  | 'PROCESSING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

export interface PaymentItem {
  id: string;
  case_id: string;
  client_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway_order_id: string;
  gateway_payment_id: string | null;
  created_at: string;
  updated_at: string | null;
  
  // Optional related data if the backend eager-loads it (based on typical patterns)
  case?: {
    case_number?: string;
    title?: string;
  };
}

export interface PaymentListResponse {
  items: PaymentItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface VerifyPaymentPayload {
  payment_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
