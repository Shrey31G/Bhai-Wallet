"use client"

import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, User, DollarSign, RefreshCw } from 'lucide-react';

export const All_transactions = ({txns: initialTxns}: {
    txns: {
        timestamp: Date,
        fromUserId: number,
        toUserId: number,
        amount: number,
        id: number
    }[]
}) => {
    const [txns, setTxns] = useState(initialTxns);
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fetchLatestTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/transactions');
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            const data = await response.json();
            setTxns(data);
            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLatestTransactions();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Also refresh on initial load
    useEffect(() => {
        fetchLatestTransactions();
    }, []);

    return (
        <div className="h-full w-full">
            <div className="max-h-[80vh] relative overflow-y-auto border border-gray-200 rounded-xl flex flex-col bg-gray-50 shadow-sm">
                <div className="sticky top-0 bg-white p-4 border-b border-gray-200 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">All Users Transaction History</h2>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchLatestTransactions} 
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            disabled={isLoading}
                        >
                            <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                            {txns.length} Transactions
                        </span>
                    </div>
                </div>
                
                <div className="px-4 pt-2 text-xs text-gray-500">
                    Last updated: {formatDate(lastRefreshed)}
                </div>
                
                {txns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <DollarSign className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-gray-500 font-medium">No transactions found</div>
                        <p className="text-gray-400 text-sm mt-1">Transactions will appear here once processed</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {txns.map((t) => (
                            <div
                                key={t.id}
                                className="flex flex-col md:flex-row md:justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex items-center mb-3 md:mb-0">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">
                                            <Calendar size={14} className="inline mr-1" />
                                            {formatDate(t.timestamp)}
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-800 mr-2">#{t.fromUserId}</span>
                                            <ArrowRight size={16} className="text-gray-400 mx-1" />
                                            <span className="font-medium text-gray-800">#{t.toUserId}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <div className="px-4 py-2 bg-green-50 rounded-lg">
                                        <span className="font-bold text-green-600">₹{(t.amount/100).toFixed(2)}</span>
                                    </div>
                                    <div className="ml-4 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                        ID: {t.id}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};