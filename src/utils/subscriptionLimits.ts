interface UsageLimits {
  maxSearchesPerDay: number;
  maxSearchesPerMonth: number;
  hasAdvancedFilters: boolean;
  hasPriorityProcessing: boolean;
  hasExportFeature: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<'free' | 'pro', UsageLimits> = {
  free: {
    maxSearchesPerDay: 5,
    maxSearchesPerMonth: 50,
    hasAdvancedFilters: false,
    hasPriorityProcessing: false,
    hasExportFeature: false
  },
  pro: {
    maxSearchesPerDay: -1, // Unlimited
    maxSearchesPerMonth: -1, // Unlimited
    hasAdvancedFilters: true,
    hasPriorityProcessing: true,
    hasExportFeature: true
  }
};

export function checkUsageLimit(plan: 'free' | 'pro', currentUsage: number, period: 'day' | 'month'): boolean {
  const limits = SUBSCRIPTION_LIMITS[plan];
  const maxUsage = period === 'day' ? limits.maxSearchesPerDay : limits.maxSearchesPerMonth;
  
  if (maxUsage === -1) return true; // Unlimited
  return currentUsage < maxUsage;
}

export function getUsageStatus(plan: 'free' | 'pro', currentUsage: number, period: 'day' | 'month'): {
  canUse: boolean;
  remaining: number;
  total: number;
} {
  const limits = SUBSCRIPTION_LIMITS[plan];
  const maxUsage = period === 'day' ? limits.maxSearchesPerDay : limits.maxSearchesPerMonth;
  
  if (maxUsage === -1) {
    return { canUse: true, remaining: -1, total: -1 };
  }
  
  return {
    canUse: currentUsage < maxUsage,
    remaining: Math.max(0, maxUsage - currentUsage),
    total: maxUsage
  };
}