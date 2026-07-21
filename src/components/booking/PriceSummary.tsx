import * as React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Receipt, ShieldCheck, Tag } from 'lucide-react';

interface PriceSummaryProps {
  price: number;
  currency: string;
  breakdown?: Array<{ label: string; value: number }>;
}

export function PriceSummary({ price, currency, breakdown }: PriceSummaryProps) {
  return (
    <div className="ota-card bg-white p-5 space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-3 border-b border-gray-100">
        <Receipt className="w-4 h-4 text-[#0F4C81]" aria-hidden />
        Price Summary
      </h3>

      <div className="space-y-2.5">
        {breakdown ? (
          breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-semibold text-gray-700">{formatCurrency(item.value, currency)}</span>
            </div>
          ))
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Base Fare / Rate</span>
            <span className="font-semibold text-gray-700">{formatCurrency(price, currency)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Taxes &amp; Fees</span>
          <span className="font-semibold text-gray-500 italic">Included</span>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between">
          <span className="text-sm font-bold text-gray-800">Total Amount</span>
          <span className="text-2xl font-black text-[#0F4C81] tabular-nums">
            {formatCurrency(price, currency)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden />
        <span>Best rate guaranteed. No hidden fees.</span>
      </div>

      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
        <Tag className="w-4 h-4 shrink-0" aria-hidden />
        <span>Simulated sandbox payment — no real charge.</span>
      </div>
    </div>
  );
}
