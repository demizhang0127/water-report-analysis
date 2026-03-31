import { User } from './types';

export function checkUserPermissions(user: User | null) {
  const now = Date.now();
  
  // Guest (not logged in)
  if (!user) {
    return {
      userType: 'guest' as const,
      canAnalyze: true,
      maxSuggestions: 1,
      canSwitchStandards: false,
      remainingCredits: 0,
    };
  }

  // Subscription user
  if (user.userType === 'subscription' && user.subscriptionEndDate && user.subscriptionEndDate > now) {
    return {
      userType: 'subscription' as const,
      canAnalyze: true,
      maxSuggestions: 3,
      canSwitchStandards: true,
      remainingCredits: Infinity,
      subscriptionEndDate: user.subscriptionEndDate,
    };
  }

  // Pay per use
  if (user.userType === 'pay_per_use' && user.remainingCredits > 0) {
    return {
      userType: 'pay_per_use' as const,
      canAnalyze: true,
      maxSuggestions: 3,
      canSwitchStandards: user.unlimitedStandardSwitch,
      remainingCredits: user.remainingCredits,
    };
  }

  // Free user (logged in but no credits/subscription)
  return {
    userType: 'free' as const,
    canAnalyze: true,
    maxSuggestions: 2,
    canSwitchStandards: false,
    remainingCredits: 0,
  };
}
