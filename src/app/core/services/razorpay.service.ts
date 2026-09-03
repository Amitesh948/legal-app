import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PaymentState = 'IDLE' | 'CREATING_ORDER' | 'AWAITING_PAYMENT' | 'VERIFYING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'UNCONFIRMED';

export interface PaymentStatus {
  state: PaymentState;
  error?: string;
  paymentId?: string;
}

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  private statusSubject = new BehaviorSubject<PaymentStatus>({ state: 'IDLE' });
  public status$: Observable<PaymentStatus> = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  reset() {
    this.statusSubject.next({ state: 'IDLE' });
  }

  async loadRazorpayScript(): Promise<void> {
    if (window.Razorpay) return;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Razorpay SDK failed to load. Please check your connection.'));
      document.body.appendChild(script);
    });
  }

  async initiatePayment(caseId: string, amount: number): Promise<void> {
    try {
      this.statusSubject.next({ state: 'CREATING_ORDER' });
      
      await this.loadRazorpayScript();

      // MITIGATION: Check for existing CREATED/PENDING order for this case before creating a new one.
      // This prevents duplicate payment rows when the user clicks Pay, dismisses, and clicks again.
      // NOTE: This is a frontend-only mitigation. The backend still needs a server-side dedup check
      // to handle race conditions (e.g. two browser tabs calling create-order simultaneously).
      let internalPaymentId: string;
      let gatewayOrderId: string;

      const existingOrder = await this.findExistingOrder(caseId);
      if (existingOrder) {
        internalPaymentId = existingOrder.id;
        gatewayOrderId = existingOrder.gateway_order_id;
      } else {
        const createOrderRes: any = await this.http.post(`${environment.apiUrl}/payments/create-order`, {
          case_id: caseId,
          amount: amount
        }).toPromise();
        internalPaymentId = createOrderRes.id;
        gatewayOrderId = createOrderRes.gateway_order_id;
      }
      
      this.statusSubject.next({ state: 'AWAITING_PAYMENT', paymentId: internalPaymentId });

      // 2. Launch Razorpay Widget
      const options = {
        key: environment.razorpayKey,
        amount: amount * 100, // Razorpay uses smallest currency unit (paise for INR)
        currency: 'INR',
        name: 'Legal AI System',
        description: `Case Payment: ${caseId.substring(0, 8)}`,
        order_id: gatewayOrderId,
        handler: async (response: any) => {
          // Success handler from Razorpay
          await this.verifyPayment(
            internalPaymentId, 
            response.razorpay_payment_id, 
            response.razorpay_order_id, 
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: () => {
            // User cancelled (closed popup manually)
            // State 4: User cancels
            this.statusSubject.next({ 
              state: 'CANCELLED', 
              paymentId: internalPaymentId,
              error: 'Payment not completed (cancelled by user).'
            });
          }
        },
        theme: {
          color: '#3880ff'
        }
      };

      const rzp = new window.Razorpay(options);
      
      // Gateway reject/failure
      rzp.on('payment.failed', (response: any) => {
         // State 3: Gateway rejects (Failed from Razorpay before verify)
         this.statusSubject.next({
           state: 'FAILED',
           paymentId: internalPaymentId,
           error: response.error.description || 'Payment failed at gateway.'
         });
      });

      rzp.open();

    } catch (err: any) {
      // Network drop during create-order or script load
      this.statusSubject.next({ 
        state: 'FAILED', 
        error: err.message || 'Failed to initialize payment. Please check your connection and try again.'
      });
    }
  }

  private async verifyPayment(paymentId: string, rzpPaymentId: string, rzpOrderId: string, rzpSignature: string) {
    try {
      this.statusSubject.next({ state: 'VERIFYING', paymentId });

      const verifyPayload = {
        payment_id: paymentId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_order_id: rzpOrderId,
        razorpay_signature: rzpSignature
      };

      await this.http.post(`${environment.apiUrl}/payments/verify`, verifyPayload).toPromise();
      
      // State 1: Success
      this.statusSubject.next({ state: 'SUCCESS', paymentId });
      
    } catch (err: any) {
      if (err.status === 400) {
        // State 3: Gateway rejects / invalid signature
        this.statusSubject.next({ 
          state: 'FAILED', 
          paymentId,
          error: err.error?.detail || 'Invalid payment signature. Payment failed validation.'
        });
      } else {
        // State 2 & 5: Verify-fails-but-payment-likely-went-through (Network drop, 500 error)
        this.statusSubject.next({ 
          state: 'UNCONFIRMED', 
          paymentId,
          error: 'Payment received but not yet confirmed by our server — please contact support if this persists.'
        });
      }
    }
  }

  /**
   * MITIGATION: Query payment history for an existing CREATED/PENDING order for this case.
   * The backend history endpoint doesn't support case_id filtering, so we fetch CREATED
   * payments and filter client-side. This is acceptable because a single client won't have
   * hundreds of CREATED orders at once.
   *
   * NOTE: This does NOT replace a backend-side dedup check — two browser tabs could still
   * race past this check simultaneously.
   */
  private async findExistingOrder(caseId: string): Promise<{ id: string; gateway_order_id: string } | null> {
    try {
      const res: any = await this.http.get(
        `${environment.apiUrl}/payments/history?status=CREATED&size=50`
      ).toPromise();

      const items = res?.items || [];
      const match = items.find((p: any) => p.case_id === caseId && p.gateway_order_id);
      return match ? { id: match.id, gateway_order_id: match.gateway_order_id } : null;
    } catch {
      // If the lookup fails, fall through to create a new order — don't block payment
      return null;
    }
  }
}
