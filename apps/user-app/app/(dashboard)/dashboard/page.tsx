"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";


const HomePage = () => {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session) {
        try {
          setLoading(true);
          const response = await fetch('/api/balance');
          if (response.ok) {
            const data = await response.json();
            setBalance(data.amount / 100);
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#002244] text-white p-6 shadow-md rounded-b-md">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hello</h1>
          </div>
          {status === "authenticated" && session?.user && (
            <div className="text-md">
              <p>{session.user.name}</p>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          {status === "unauthenticated" && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p>Please log in to view your balance and use the app.</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-[#0a2351]">
            <div className="bg-[#E0FFFF] p-4 border-b border-[#0a2351]">
              <h2 className="text-[#004687] font-medium text-lg">Current Balance</h2>
            </div>
            <div className="p-6 flex items-center justify-center">
              {status === "loading" || loading ? (
                <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
              ) : status === "authenticated" ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">₹{balance.toLocaleString('en-IN')}</div>
                  <div className="text-sm text-gray-500 mt-2">Available for spending</div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Sign in to view your balance</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#0a2351]">
            <div className="bg-[#E0FFFF] p-4 border-b border-[#0a2351]">
              <h2 className="text-[#004687] font-medium text-lg ">About PayHaven</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                PayHaven is your all-in-one digital wallet solution that makes financial transactions simple, secure, and instant.
              </p>

              <h3 className="font-medium text-lg text-gray-800 mb-2">Key Features:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <div className="bg-purple-100 p-1 rounded-full mr-2 mt-1">
                    <div className="w-4 h-4 bg-[#002244] rounded-full"></div>
                  </div>
                  <span>Send money instantly to anyone</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-100 p-1 rounded-full mr-2 mt-1">
                    <div className="w-4 h-4 bg-[#002244] rounded-full"></div>
                  </div>
                  <span>Pay bills and utilities without fees</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-100 p-1 rounded-full mr-2 mt-1">
                    <div className="w-4 h-4 bg-[#002244] rounded-full"></div>
                  </div>
                  <span>Add money easily from any bank account</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-100 p-1 rounded-full mr-2 mt-1">
                    <div className="w-4 h-4 bg-[#002244] rounded-full"></div>
                  </div>
                  <span>Secure transactions with end-to-end encryption</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;