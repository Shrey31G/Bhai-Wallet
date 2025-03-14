"use client";

import { Suspense } from 'react';
import { BalanceDisplay } from './components/BalanceDisplay';
import Payment from './components/Payment';

function PaymentWithSuspense() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading payment details...</div>}>
      <Payment />
    </Suspense>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50">
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800">FakeBank Payment Portal</h1>
          <p className="text-emerald-600 mt-2">
            Complete your secure transaction below
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <BalanceDisplay />
              <PaymentWithSuspense />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}