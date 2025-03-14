"use client";

import { Card } from "@repo/ui/card";
import { useEffect, useState } from "react";
import { ArrowDownCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";

export enum OnRampStatus {
  Success = "Success",
  Failure = "Failure",
  Processing = "Processing"
}

type Transaction = {
  time: Date,
  amount: number,
  status: OnRampStatus,
  provider: string
};

export const OnRampTransaction = ({
  initialTransactions
}: {
  initialTransactions: Transaction[]
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        const parsedTransactions = data.transactions.map((t: any) => ({
          ...t,
          time: new Date(t.time)
        }));
        setTransactions(parsedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'payment_completed') {
        fetchTransactions();
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const hasProcessingTxn = transactions.some(t => t.status === OnRampStatus.Processing);
    
    let intervalId: NodeJS.Timeout | null = null;
    
    if (hasProcessingTxn) {
      intervalId = setInterval(fetchTransactions, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transactions]);

  if (!transactions.length) {
    return (
      <Card title="Recent Transactions">
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ArrowDownCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Recent Transactions</h3>
          <p className="text-sm text-gray-500">Your transaction history will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recent Transactions">
      <div className="max-h-[60vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <ArrowDownCircle className="h-5 w-5 mr-2 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
          </div>
          {loading && (
            <div className="flex items-center text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {transactions.map((t, index) => {
              const statusConfig = {
                [OnRampStatus.Success]: {
                  bgColor: "bg-green-50",
                  hoverColor: "hover:bg-green-100",
                  textColor: "text-green-600",
                  icon: <ArrowDownCircle className="h-5 w-5 mr-2 text-green-500" />,
                  label: "Received Money"
                },
                [OnRampStatus.Processing]: {
                  bgColor: "bg-blue-50",
                  hoverColor: "hover:bg-blue-100",
                  textColor: "text-blue-600",
                  icon: <Clock className="h-5 w-5 mr-2 text-blue-500" />,
                  label: "Processing"
                },
                [OnRampStatus.Failure]: {
                  bgColor: "bg-red-50",
                  hoverColor: "hover:bg-red-100",
                  textColor: "text-red-600",
                  icon: <AlertCircle className="h-5 w-5 mr-2 text-red-500" />,
                  label: "Failed"
                }
              };
              
              const config = statusConfig[t.status];
              
              return (
                <div 
                  key={index} 
                  className={`flex justify-between items-center w-full p-4 rounded-lg ${config.bgColor} ${config.hoverColor} transition-colors border border-gray-100 shadow-sm`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="flex items-center mb-1 sm:mb-0">
                      {config.icon}
                      <div className={`text-sm font-medium ${config.textColor}`}>
                        {config.label}
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs sm:ml-3">
                      {formatDate(t.time)}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className={`font-medium ${t.status === OnRampStatus.Success ? "text-green-600" : "text-gray-600"}`}>
                      + {formatCurrency(t.amount)}
                    </div>
                    <div className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hidden md:block">
                      {t.provider}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};