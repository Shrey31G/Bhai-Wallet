"use client";

import { useEffect, useState } from "react";

export function BalanceDisplay() {
  const [balance, setBalance] = useState(100000000);
  
  useEffect(() => {
    fetch('/api/balance')
      .then(res => res.json())
      .then(data => {
        setBalance(data.balance);
      });
  }, []);

  return (
    <div className="flex items-center justify-center bg-emerald-100 p-6 rounded-lg shadow-md mb-8">
      <div className="text-center">
        <div className="text-lg text-emerald-900 font-medium">Available Bank Balance:</div>
        <div className="text-3xl font-bold text-emerald-700">₹{balance.toLocaleString('en-IN')}</div>
        <div className="text-sm text-emerald-600 mt-2">
          Universal Pool - Everyone can withdraw from this balance
        </div>
      </div>
    </div>
  );
}