import { 
  Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { Subject, timer, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorStateComponent } from '../error-state/error-state.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { MessageDeliveryStatus } from '../../constants/message-delivery.constants';

export interface ChatMessage {
  id: string;
  sender_id: string | null;
  sender_name?: string;
  message_type?: string;
  message: string;
  created_at: string;
  is_read?: boolean;
  attachments?: any[];
  deliveryStatus?: MessageDeliveryStatus;
}

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    AvatarComponent
  ],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.scss'
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  @Input() caseId!: string;
  @Input() isInternal = false;

  @ViewChild(IonContent, { static: false }) ionContent!: IonContent;
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;

  currentUserId: string | null = null;
  messages: ChatMessage[] = [];
  newMessageText = '';
  
  loading = true;
  error = false;
  isSending = false;

  private destroy$ = new Subject<void>();
  private userNearBottom = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    this.currentUserId = user?.id || null;
    if (this.caseId) {
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private get endpoint(): string {
    return this.isInternal 
      ? `/cases/${this.caseId}/internal-notes` 
      : `/cases/${this.caseId}/messages`;
  }

  private startPolling() {
    this.loading = true;
    this.error = false;

    timer(0, 5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          if (document.hidden) {
            return of(null);
          }
          return this.api.get<ChatMessage[]>(this.endpoint).pipe(
            catchError(() => {
              if (this.loading) {
                this.error = true;
                this.loading = false;
                this.cdr.detectChanges();
              }
              return of(null);
            })
          );
        })
      )
      .subscribe((incoming) => {
        if (incoming && Array.isArray(incoming)) {
          this.mergeMessages(incoming);
          if (this.loading) {
            this.loading = false;
            this.scrollToBottom(true);
          }
        } else if (!incoming && this.messages.length === 0 && !this.error) {
          this.loading = false;
        }
        this.cdr.detectChanges();
      });
  }

  private mergeMessages(fetched: ChatMessage[]) {
    let hasNewMessages = false;
    const existingIds = new Set(this.messages.map(m => m.id));

    for (const msg of fetched) {
      if (!existingIds.has(msg.id)) {
        // Fallback match for optimistic messages:
        // Requiring ID prefix 'temp-', text equality, sender match, and timestamp proximity (< 60s)
        const optIndex = this.messages.findIndex(m => {
          if (!m.id.startsWith('temp-') || m.message !== msg.message) return false;
          const sameSender = !m.sender_id || m.sender_id === msg.sender_id || m.sender_id === this.currentUserId;
          const mTime = new Date(m.created_at).getTime();
          const sTime = new Date(msg.created_at).getTime();
          const nearTime = (!isNaN(mTime) && !isNaN(sTime)) ? Math.abs(mTime - sTime) < 60000 : true;
          return sameSender && nearTime;
        });

        if (optIndex !== -1) {
          this.messages[optIndex] = { ...msg, deliveryStatus: MessageDeliveryStatus.SENT };
          existingIds.add(msg.id);
        } else {
          this.messages.push({ ...msg, deliveryStatus: MessageDeliveryStatus.SENT });
          existingIds.add(msg.id);
          hasNewMessages = true;
        }
      }
    }

    if (hasNewMessages && this.userNearBottom) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    const text = this.newMessageText.trim();
    if (!text || this.isSending) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender_id: this.currentUserId,
      sender_name: 'You',
      message: text,
      created_at: new Date().toISOString(),
      deliveryStatus: MessageDeliveryStatus.SENDING
    };

    this.messages.push(optimisticMsg);
    this.newMessageText = '';
    this.scrollToBottom();

    const formData = new FormData();
    formData.append('message', text);

    this.api.post<any>(this.endpoint, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const target = this.messages.find(m => m.id === tempId);
          if (target) {
            target.id = res.message_id || target.id;
            target.deliveryStatus = MessageDeliveryStatus.SENT;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          const target = this.messages.find(m => m.id === tempId);
          if (target) {
            target.deliveryStatus = MessageDeliveryStatus.FAILED;
          }
          this.cdr.detectChanges();
        }
      });
  }

  retrySend(msg: ChatMessage) {
    if (msg.deliveryStatus !== MessageDeliveryStatus.FAILED) return;

    msg.deliveryStatus = MessageDeliveryStatus.SENDING;
    const formData = new FormData();
    formData.append('message', msg.message);

    this.api.post<any>(this.endpoint, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          msg.id = res.message_id || msg.id;
          msg.deliveryStatus = MessageDeliveryStatus.SENT;
          this.cdr.detectChanges();
        },
        error: () => {
          msg.deliveryStatus = MessageDeliveryStatus.FAILED;
          this.cdr.detectChanges();
        }
      });
  }

  onScroll(event: any) {
    if (event && event.detail) {
      const { scrollTop, scrollHeight, clientHeight } = event.detail;
      this.userNearBottom = (scrollHeight - scrollTop - clientHeight) < 100;
    }
  }

  private scrollToBottom(immediate = false) {
    if (this.ionContent) {
      this.ionContent.scrollToBottom(immediate ? 0 : 300);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isOutgoing(msg: ChatMessage): boolean {
    if (msg.sender_id && this.currentUserId) {
      return msg.sender_id === this.currentUserId;
    }
    return msg.sender_name === 'You';
  }

  getFirstName(fullName?: string): string {
    if (!fullName) return '';
    return fullName.split(' ')[0] || '';
  }

  getLastName(fullName?: string): string {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
}
