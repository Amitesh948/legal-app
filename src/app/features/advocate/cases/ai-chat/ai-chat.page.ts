import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, 
  IonTitle, IonContent, IonSpinner, IonFooter, IonTextarea 
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AiChatService, AIMessage, AIConversation } from '../../../../core/services/ai-chat.service';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ErrorStateComponent,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, 
    IonTitle, IonContent, IonSpinner, IonFooter, IonTextarea
  ],
  templateUrl: './ai-chat.page.html',
  styleUrl: './ai-chat.page.scss'
})
export class AiChatPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  caseId: string = '';
  conversationId?: string;
  messages: AIMessage[] = [];
  
  inputText: string = '';
  isTyping: boolean = false;
  
  loading: boolean = true;
  error: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiChatService: AiChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.caseId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.caseId) {
      this.showError('Invalid Case ID.');
      return;
    }
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    this.error = false;
    this.aiChatService.getConversations(this.caseId).subscribe({
      next: (conversations: AIConversation[]) => {
        // For this scaffold, we just grab the first conversation if it exists.
        if (conversations && conversations.length > 0) {
          const activeConv = conversations[0];
          this.conversationId = activeConv.id;
          this.messages = activeConv.messages || [];
        }
        this.loading = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.loading = false;
        this.showError(err.message);
      }
    });
  }

  sendMessage() {
    const text = this.inputText.trim();
    if (!text || this.isTyping) return;

    // Add optimistic user message
    this.messages.push({
      role: 'USER',
      message: text
    });
    this.inputText = '';
    this.isTyping = true;
    this.scrollToBottom();

    this.aiChatService.sendCaseMessage(this.caseId, {
      message: text,
      conversation_id: this.conversationId
    }).subscribe({
      next: (res) => {
        this.conversationId = res.conversation_id;
        this.messages.push({
          id: res.message_id,
          role: 'AI',
          message: res.answer,
          sources: res.sources
        });
        this.isTyping = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.messages.push({
          role: 'SYSTEM',
          message: err.message || 'Failed to send message.'
        });
        this.isTyping = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, 100);
  }

  private showError(msg: string) {
    this.error = true;
    this.errorMessage = msg;
    this.cdr.detectChanges();
  }

  goBack() {
    this.router.navigate(['/advocate/cases', this.caseId]);
  }
}
