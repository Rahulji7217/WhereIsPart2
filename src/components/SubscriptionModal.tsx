import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const plans = {
    monthly: {
      price: '$9.99',
      period: 'month',
      savings: null,
      priceId: 'price_monthly_id'
    },
    yearly: {
      price: '$99.99',
      period: 'year',
      savings: 'Save 17%',
      priceId: 'price_yearly_id'
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Integrate with Stripe Checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plans[selectedPlan].priceId,
          mode: 'subscription'
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl bg-black border border-white/20 rounded-3xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-white rounded-xl">
                  <Crown className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-3xl font-black text-white">WhereIsPart2 Pro</h2>
              </div>
              <p className="text-gray-400 text-lg">
                Unlock unlimited series discovery and premium features
              </p>
            </div>

            {/* Plan Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/10 rounded-2xl p-2 flex">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedPlan === 'monthly'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
                    selectedPlan === 'yearly'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly
                  {plans.yearly.savings && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {plans.yearly.savings}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center mb-8">
              <div className="text-5xl font-black text-white mb-2">
                {plans[selectedPlan].price}
              </div>
              <div className="text-gray-400">
                per {plans[selectedPlan].period}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                'Unlimited series searches',
                'Priority AI processing',
                'Advanced similarity filters',
                'Export search results',
                'No rate limits',
                'Premium support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-1 bg-white rounded-full">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Start Pro Subscription
                  <Star className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Cancel anytime. No hidden fees.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}