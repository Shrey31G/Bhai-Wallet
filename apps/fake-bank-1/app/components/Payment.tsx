"use client";

import { TextInput } from "@repo/ui/TextInput";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionResult } from "../lib/types";

export default function Payment() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bankBalance, setBankBalance] = useState(100000000);
  const [transactionDetails, setTransactionDetails] = useState<TransactionResult | null>(null);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const requestedAmount = searchParams.get('amount');

  useEffect(() => {
    fetch('/api/balance')
      .then(res => res.json())
      .then(data => {
        setBankBalance(data.balance);
      });

    if (requestedAmount) {
      setAmount(requestedAmount);
    }
  }, [requestedAmount]);

  const handlePayment = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const paymentAmount = Number(amount);
    
    if (paymentAmount > bankBalance) {
      setError("Insufficient funds in the bank");
      return;
    }

    if (!token || !userId) {
      setError("Missing transaction details");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId,
          amount: paymentAmount
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment failed");
      }

      setBankBalance(prev => prev - paymentAmount);
      setTransactionDetails(data);
      setSuccess(true);

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage('payment_completed', '*');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="bg-green-100 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Payment Successful!</h2>
          <p className="text-green-600">Amount: ₹{(Number(amount)).toLocaleString('en-IN')}</p>
          <p className="text-sm text-green-600 mt-2">Transaction ID: {token}</p>
          {transactionDetails && transactionDetails.transactionId && (
            <p className="text-sm text-green-600">Receipt ID: {transactionDetails.transactionId}</p>
          )}
        </div>
        <button 
          onClick={() => {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage('payment_completed', '*');
            }
            window.close();
          }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md"
        >
          Close Window
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center flex-col p-6">
      <div className="w-full max-w-md space-y-6">
        {error && (
          <div className="mb-4 mt-2 p-3 bg-red-100 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">Requested Amount:</p>
          <TextInput
            placeholder="Enter amount"
            label="Payment Amount (₹)"
            value={amount}
            onChange={(val) => setAmount(val)}
            type="number"
          />
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Transaction Details:</p>
          <div className="bg-gray-50 p-3 rounded mt-2">
            <p className="text-sm"><strong>Token:</strong> {token || 'N/A'}</p>
            <p className="text-sm"><strong>User ID:</strong> {userId || 'N/A'}</p>
          </div>
        </div>

        <button 
          onClick={handlePayment}
          disabled={loading}
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md`}
        >
          {loading ? 'Processing...' : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
}