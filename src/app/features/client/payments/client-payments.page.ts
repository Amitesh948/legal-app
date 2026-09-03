import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge, 
  IonButton, IonSpinner, IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/angular';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentItem } from '../../../core/models/payment.model';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    Razorpay: any;
  }
}

import { RazorpayService } from '../../../core/services/razorpay.service';

@Component({
  selector: 'app-client-payments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './client-payments.page.html',
  styleUrl: './client-payments.page.scss'
})
export class ClientPaymentsPage implements OnInit {
  payments: PaymentItem[] = [];
  loading = true;
  error = false;
  
  page = 0;
  size = 10;
  hasMore = true;

  activePaymentId: string | null = null;
  verifyErrorText: string | null = null;
  cancelText: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private razorpayService: RazorpayService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData(event?: any, isRefresh = false) {
    if (isRefresh) {
      this.page = 0;
      this.hasMore = true;
      this.error = false;
      this.verifyErrorText = null;
      this.cancelText = null;
      if (!event) this.loading = true;
    }

    if (!this.hasMore) {
      if (event) event.target.complete();
      return;
    }

    this.paymentService.getPayments(this.page, this.size).subscribe({
      next: (res) => {
        if (isRefresh) {
          this.payments = res.items || [];
        } else {
          this.payments = [...this.payments, ...(res.items || [])];
        }
        
        this.hasMore = this.payments.length < res.total;
        this.page++;
        this.loading = false;
        
        if (event) event.target.complete();
        this.cdr.detectChanges();
      },
      error: () => {
        if (this.payments.length === 0) {
          this.error = true;
        }
        this.loading = false;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      }
    });
  }

  payNow(payment: PaymentItem) {
    if (this.activePaymentId) return; // Prevent double clicks
    
    this.activePaymentId = payment.id;
    this.verifyErrorText = null;
    this.cancelText = null;
    this.cdr.detectChanges();

    // Subscribe to state changes from our new centralized service
    const sub = this.razorpayService.status$.subscribe(status => {
      // Ignore events for other payments if any
      if (status.paymentId && status.paymentId !== this.activePaymentId && status.state !== 'CREATING_ORDER') return;

      switch(status.state) {
        case 'SUCCESS':
          payment.status = 'SUCCESS';
          this.activePaymentId = null;
          sub.unsubscribe();
          break;
        case 'FAILED':
          payment.status = 'FAILED';
          this.verifyErrorText = status.error || 'Payment failed.';
          this.activePaymentId = null;
          sub.unsubscribe();
          break;
        case 'CANCELLED':
          this.cancelText = status.error || 'Payment cancelled.';
          this.activePaymentId = null;
          sub.unsubscribe();
          break;
        case 'UNCONFIRMED':
          this.verifyErrorText = status.error || 'Payment unconfirmed.';
          this.activePaymentId = null;
          sub.unsubscribe();
          break;
        case 'IDLE':
          break;
        // AWAITING_PAYMENT, VERIFYING, CREATING_ORDER are transitional
      }
      this.cdr.detectChanges();
    });

    this.razorpayService.initiatePayment(payment.case_id, payment.amount).catch(err => {
      this.activePaymentId = null;
      this.verifyErrorText = 'Failed to initialize order on server.';
      sub.unsubscribe();
      this.cdr.detectChanges();
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'PENDING':
      case 'CREATED': 
      case 'PROCESSING': return 'warning';
      case 'FAILED':
      case 'CANCELLED': return 'danger';
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED': return 'medium';
      default: return 'primary';
    }
  }

  formatStatus(status: string): string {
    if (status === 'SUCCESS') return 'Paid';
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
}
