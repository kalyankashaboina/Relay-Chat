import { Message, FileAttachment, MessageStatus } from '@/types/chat';

// Configuration for mock API behavior
const CONFIG = {
  messageDelay: { min: 500, max: 1500 },
  uploadDelay: { min: 1000, max: 3000 },
  failureRate: 0.15, // 15% failure rate
  uploadProgressInterval: 100,
};

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldFail(): boolean {
  return Math.random() < CONFIG.failureRate;
}

export interface SendMessageResult {
  success: boolean;
  messageId: string;
  status: MessageStatus;
  error?: string;
}

export interface UploadFileResult {
  success: boolean;
  fileId: string;
  status: MessageStatus;
  error?: string;
}

// Simulate sending a message
export function mockSendMessage(message: Message): Promise<SendMessageResult> {
  return new Promise((resolve) => {
    const delay = randomDelay(CONFIG.messageDelay.min, CONFIG.messageDelay.max);
    
    setTimeout(() => {
      if (shouldFail()) {
        resolve({
          success: false,
          messageId: message.id,
          status: 'failed',
          error: 'Network error: Failed to send message',
        });
      } else {
        resolve({
          success: true,
          messageId: message.id,
          status: 'sent',
        });
      }
    }, delay);
  });
}

// Simulate file upload with progress
export function mockUploadFile(
  file: FileAttachment,
  onProgress: (progress: number) => void
): Promise<UploadFileResult> {
  return new Promise((resolve) => {
    const totalDuration = randomDelay(CONFIG.uploadDelay.min, CONFIG.uploadDelay.max);
    const steps = Math.ceil(totalDuration / CONFIG.uploadProgressInterval);
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 95);
      onProgress(progress);

      if (currentStep >= steps) {
        clearInterval(interval);
        
        // Final delay before completion
        setTimeout(() => {
          if (shouldFail()) {
            onProgress(0);
            resolve({
              success: false,
              fileId: file.id,
              status: 'failed',
              error: 'Upload failed: Server error',
            });
          } else {
            onProgress(100);
            resolve({
              success: true,
              fileId: file.id,
              status: 'sent',
            });
          }
        }, 200);
      }
    }, CONFIG.uploadProgressInterval);
  });
}

// Simulate receiving a reply message
export function mockReceiveReply(originalMessage: string): Promise<Message> {
  const replies = [
    "Got it! Thanks for the message.",
    "Interesting, tell me more!",
    "I'll get back to you on that.",
    "👍 Sounds good!",
    "Let me think about it...",
    "That's a great point!",
    "I agree completely.",
    "Hmm, not sure about that.",
  ];

  return new Promise((resolve) => {
    const delay = randomDelay(1000, 3000);
    
    setTimeout(() => {
      resolve({
        id: `msg-${Date.now()}-reply`,
        content: replies[Math.floor(Math.random() * replies.length)],
        senderId: 'other-user',
        timestamp: new Date(),
        status: 'sent',
        attachments: [],
        isOwn: false,
      });
    }, delay);
  });
}

// Validate file before upload
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  text: ['text/plain', 'text/markdown', 'text/csv'],
};

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'error.fileTooLarge' };
  }

  const allAllowedTypes = Object.values(ALLOWED_TYPES).flat();
  if (!allAllowedTypes.includes(file.type)) {
    return { valid: false, error: 'error.unsupportedFile' };
  }

  return { valid: true };
}

export function getFileType(mimeType: string): FileAttachment['type'] {
  for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type as FileAttachment['type'];
    }
  }
  return 'document';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
