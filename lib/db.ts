import { User, Report, Transaction } from './types';

// Simple in-memory storage (replace with real DB in production)
const users = new Map<string, User>();
const reports = new Map<string, Report>();
const transactions: Transaction[] = [];

export const db = {
  // User operations
  getUser: (id: string) => users.get(id),
  
  createUser: (user: User) => {
    users.set(user.id, user);
    return user;
  },
  
  updateUser: (id: string, updates: Partial<User>) => {
    const user = users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates };
    users.set(id, updated);
    return updated;
  },

  // Report operations
  getReport: (id: string) => reports.get(id),
  
  getUserReports: (userId: string) => 
    Array.from(reports.values()).filter(r => r.userId === userId),
  
  createReport: (report: Report) => {
    reports.set(report.id, report);
    return report;
  },
  
  updateReport: (id: string, updates: Partial<Report>) => {
    const report = reports.get(id);
    if (!report) return null;
    const updated = { ...report, ...updates };
    reports.set(id, updated);
    return updated;
  },

  // Transaction operations
  createTransaction: (tx: Transaction) => {
    transactions.push(tx);
    return tx;
  },
  
  getUserTransactions: (userId: string) =>
    transactions.filter(t => t.userId === userId),
};
