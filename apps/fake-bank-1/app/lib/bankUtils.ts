import { PaymentDetails, TransactionResult } from './types';

export function validatePayment(payment: PaymentDetails): { valid: boolean; error?: string } {
  if (!payment.token) {
    return { valid: false, error: 'Missing token' };
  }
  
  if (!payment.userId) {
    return { valid: false, error: 'Missing userId' };
  }
  
  if (!payment.amount || isNaN(payment.amount) || payment.amount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  return { valid: true };
}

/**
 * Creates a unique transaction ID
 */
export function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Process transaction with the TransactionResult type
 */
export function processTransaction(details: PaymentDetails): TransactionResult {
  // Implementation would go here
  return {
    success: true,
    message: "Transaction processed successfully",
    transactionId: generateTransactionId(),
    amount: details.amount
  };
}