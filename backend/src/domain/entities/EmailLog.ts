export enum EmailStatus {
    SENT = 'SENT',
    FAILED = 'FAILED'
  }
  
  export interface EmailLog {
    id?: string;
    budgetaryOfferId: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    content: string;
    messageId?: string;
    status: EmailStatus;
    error?: string;
    sentAt?: Date;
  }
  