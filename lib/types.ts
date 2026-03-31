// User types
export type UserType = 'free' | 'subscription' | 'pay_per_use';

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  userType: UserType;
  subscriptionEndDate?: number;
  remainingCredits: number;
  unlimitedStandardSwitch: boolean;
  createdAt: number;
  lastLoginAt: number;
}

export interface Report {
  id: string;
  userId: string;
  country: string;
  unlockStatus: 'partial' | 'full';
  usedStandards: string[];
  paidAmount: number;
  createdAt: number;
  result: any;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'subscription' | 'credit_purchase';
  amount: number;
  credits?: number;
  subscriptionDays?: number;
  createdAt: number;
}
