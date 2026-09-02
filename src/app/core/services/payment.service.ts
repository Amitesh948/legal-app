import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaymentListResponse, PaymentItem, VerifyPaymentPayload } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private api: ApiService) {}

  getPayments(page: number = 0, size: number = 10): Observable<PaymentListResponse> {
    return this.api.get<PaymentListResponse>(`/payments/history?page=${page}&size=${size}`);
  }

  createOrder(caseId: string, amount: number): Observable<PaymentItem> {
    return this.api.post<PaymentItem>('/payments/create-order', {
      case_id: caseId,
      amount: amount
    });
  }

  verifyPayment(payload: VerifyPaymentPayload): Observable<any> {
    return this.api.post<any>('/payments/verify', payload);
  }
}
