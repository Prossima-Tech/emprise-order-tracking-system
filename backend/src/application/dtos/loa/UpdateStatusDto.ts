export interface UpdateStatusDto {
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
  reason?: string; // Optional reason for status change
} 