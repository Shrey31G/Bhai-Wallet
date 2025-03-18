"use client";

import { Card } from "@repo/ui/card";
import { Wallet, CreditCard, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export const BalanceCard = ({ 
  amount,   
  locked 
}: {
  amount: number;
  locked: number 
}) => {
  const [balance, setBalance] = useState({ amount, locked });
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value / 100);
  };

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance({
          amount: data.amount || 0,
          locked: data.locked || 0
        });
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'payment_completed') {
        fetchBalance();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    setBalance({ amount, locked });
  }, [amount, locked]);

  const totalBalance = balance.amount + balance.locked;

  return (
    <Card title="Balance Overview">
      <div className="p-4 bg-gradient-to-r from-[#89CFF0] to-white rounded-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3">
              <Wallet className="h-6 w-6 text-black" />
            </div>
            <div>
              <div className="text-sm text-gray-700">Total Balance</div>
              <div className="text-2xl font-bold text-[#002D62]">
                {formatCurrency(totalBalance)}
              </div>
            </div>
          </div>
          {loading && (
            <div className="flex items-center text-sm text-[#002D62] bg-purple-50 px-3 py-1 rounded-full">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-500" />
              <div className="text-gray-700">Unlocked Balance</div>
            </div>
            <div className="font-semibold text-green-600">
              {formatCurrency(balance.amount)}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center">
              <div className="text-gray-700">Locked Balance</div>
            </div>
            <div className="font-semibold text-[#850101]">
              {formatCurrency(balance.locked)}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">Available for withdrawal</div>
            <div className="font-medium text-green-600">{formatCurrency(balance.amount)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};