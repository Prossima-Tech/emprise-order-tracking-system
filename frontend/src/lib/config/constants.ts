export const API_BASE_URL = 'http://ec2-54-157-42-190.compute-1.amazonaws.com/api';
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;