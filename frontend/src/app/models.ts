export interface LoginResponse {
  token: string;
  tokenType: string;
  username: string;
  role: string;
  clientId?: number | null;
}

export interface Account {
  id: number;
  accountNumber: string;
  type: 'SAVINGS' | 'CURRENT';
  createdAt: string;
  balance: number;
  ownerId: number;
  ownerFullName: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  phoneNumber: string;
  email: string;
  nationality: string;
  accounts: Account[];
}

export interface BankTransaction {
  id: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  amount: number;
  transactionDate: string;
  description: string;
  relatedAccountNumber: string | null;
}
