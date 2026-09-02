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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadRazorpayScript();
    this.loadData();
  }

  loadRazorpayScript() {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
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

    // 1. Create order
    this.paymentService.createOrder(payment.case_id, payment.amount).subscribe({
      next: (order) => {
        // 2. Initialize Razorpay
        const options = {
          key: environment.razorpayKey,
          amount: order.amount * 100, // paise
          currency: order.currency || 'INR',
          name: 'Legal AI System',
          description: 'Payment for Invoice',
          order_id: order.gateway_order_id,
          handler: (response: any) => {
            // 3. Verify Payment
            this.verifyPayment(payment, order.id, response);
          },
          modal: {
            ondismiss: () => {
              this.activePaymentId = null;
              this.cancelText = 'Payment not completed (cancelled by user).';
              this.cdr.detectChanges();
            }
          },
          theme: { color: '#1a365d' }
        };
        
        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (response: any) => {
            this.activePaymentId = null;
            this.verifyErrorText = 'Payment failed at gateway: ' + (response.error?.description || 'Unknown error');
            payment.status = 'FAILED';
            this.cdr.detectChanges();
          });
          rzp.open();
        } catch (err) {
          this.activePaymentId = null;
          this.verifyErrorText = 'Could not load Razorpay. Please check your internet connection.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.activePaymentId = null;
        this.verifyErrorText = 'Failed to initialize order on server.';
        this.cdr.detectChanges();
      }
    });
  }

  private verifyPayment(payment: PaymentItem, orderId: string, response: any) {
    this.paymentService.verifyPayment({
      payment_id: orderId,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature
    }).subscribe({
      next: () => {
        // ONLY update UI to success on verified 200 response
        payment.status = 'SUCCESS';
        this.activePaymentId = null;
        this.verifyErrorText = null;
        this.cancelText = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.activePaymentId = null;
        this.verifyErrorText = 'Payment received but not yet confirmed by our server — please contact support if this persists.';
        this.cdr.detectChanges();
      }
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
