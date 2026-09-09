import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/document.service';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DocumentUploadComponent {
  @Input() caseId!: string;
  @Output() uploadComplete = new EventEmitter<any>();

  isDragging = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  selectedFile: File | null = null;
  selectedCategory = 'OTHER';

  readonly MAX_SIZE_MB = 10;
  readonly MAX_SIZE_BYTES = this.MAX_SIZE_MB * 1024 * 1024;
  readonly ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/png',
    'image/jpeg'
  ];

  constructor(private documentService: DocumentService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.validateAndSetFile(event.target.files[0]);
    }
  }

  validateAndSetFile(file: File) {
    this.errorMessage = '';
    
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage = 'Invalid file type. Only PDF, DOCX, DOC, PNG, and JPG are allowed.';
      this.selectedFile = null;
      return;
    }
    
    if (file.size > this.MAX_SIZE_BYTES) {
      this.errorMessage = `File size exceeds ${this.MAX_SIZE_MB}MB limit.`;
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  clearSelection() {
    this.selectedFile = null;
    this.errorMessage = '';
    this.uploadProgress = 0;
  }

  uploadFile() {
    if (!this.selectedFile || !this.caseId) return;

    this.isUploading = true;
    this.errorMessage = '';
    this.uploadProgress = 0;

    this.documentService.uploadDocument(this.caseId, this.selectedFile, this.selectedCategory).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
        } else if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          this.uploadProgress = 100;
          this.uploadComplete.emit(event.body);
          this.clearSelection();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isUploading = false;
        this.errorMessage = error.error?.detail || 'Failed to upload document. Please try again.';
      }
    });
  }
}
