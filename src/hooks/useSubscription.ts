import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: 'free' | 'pro';
  expiresAt: string | null;
  isLoading: boolean;
}

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    plan: 'free',
    expiresAt: null,
    isLoading: true
  });

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // In a real implementation, you'd check with your backend/Stripe
      // For now, we'll simulate with localStorage
      const subscription = localStorage.getItem('subscription_status');
      
      if (subscription) {
        const parsed = JSON.parse(subscription);
        setStatus({
          isSubscribed: parsed.isSubscribed,
          plan: parsed.plan,
          expiresAt: parsed.expiresAt,
          isLoading: false
        });
      } else {
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateSubscriptionStatus = (newStatus: Partial<SubscriptionStatus>) => {
    setStatus(prev => ({ ...prev, ...newStatus }));
    localStorage.setItem('subscription_status', JSON.stringify({
      ...status,
      ...newStatus
    }));
  };

  return {
    ...status,
    updateSubscriptionStatus,
    checkSubscriptionStatus
  };
}