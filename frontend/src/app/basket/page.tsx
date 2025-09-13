'use client';

import BasketImpact from '@/components/BasketImpact';

export default function BasketPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <BasketImpact />
      </div>
    </div>
  );
}
