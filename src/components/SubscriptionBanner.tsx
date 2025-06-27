import React from 'react';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionBannerProps {
  onUpgrade: () => void;
}

export function SubscriptionBanner({ onUpgrade }: SubscriptionBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl mb-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Upgrade to WhereIsPart2 Pro
            </h3>
            <p className="text-gray-400 text-sm">
              Unlimited searches, priority processing, and advanced features
            </p>
          </div>
        </div>
        
        <button
          onClick={onUpgrade}
          className="group bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Upgrade Now
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}