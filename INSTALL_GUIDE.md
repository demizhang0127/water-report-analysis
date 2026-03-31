# 用户体系代码安装指南

## 步骤 1: 创建 lib/types.ts

在项目根目录执行：
```bash
mkdir -p lib
cat > lib/types.ts << 'EOF'
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
EOF
```

继续下一步？输入 "继续" 我会发送下一个文件。
