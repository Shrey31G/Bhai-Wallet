export interface PaymentDetails {
  token: string;
  userId: string;
  amount: number;
}

export interface TransactionResult {
  success: boolean;
  message: string;
  transactionId?: string;
  amount?: number;
  error?: string;
}

export interface BankBalance {
  balance: number;
}