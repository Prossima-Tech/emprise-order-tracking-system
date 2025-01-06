// src/modules/purchase-orders/utils/validation.ts
import { POCreateInput, POItem } from '@emprise/shared/src/types/purchase-order';

export const validatePOInput = (input: POCreateInput) => {
  const errors: Record<string, string> = {};

  if (!input.loaId) {
    errors.loaId = 'LOA is required';
  }

  if (!input.vendorId) {
    errors.vendorId = 'Vendor is required';
  }

  if (!input.deliveryDate) {
    errors.deliveryDate = 'Delivery date is required';
  }

  if (!input.items || input.items.length === 0) {
    errors.items = 'At least one item is required';
  }

  return errors;
};

export const validatePOItem = (item: POItem) => {
  const errors: Record<string, string> = {};

  if (!item.itemId) {
    errors.itemId = 'Item is required';
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }

  if (!item.unitPrice || item.unitPrice <= 0) {
    errors.unitPrice = 'Unit price must be greater than 0';
  }

  return errors;
};