"use client";

import { Button } from "./button";
import { useRouter } from "next/navigation";
import { Wallet, LogOut, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";

interface AppbarProps {
  user?: {
    name?: string | null;
  };
  onSignin: () => void;
  onSignout: () => void;
}

export const Appbar = ({ user, onSignin, onSignout }: AppbarProps) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Bhai Wallet
            </div>
          </div>


          <div className="hidden md:flex items-center space-x-4">
            {user?.name && (
              <div className="text-gray-700 px-3 py-1 rounded-full bg-gray-100">
                Welcome {user.name}
              </div>
            )}
            <Button 
              onClick={user ? onSignout : onSignin}
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4 mr-2 " />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-3 border-t border-gray-200">
            {user?.name && (
              <div className="text-gray-700 p-3 rounded-md bg-gray-50">
                Welcome, {user.name}
              </div>
            )}
            <Button 
              onClick={user ? onSignout : onSignin}
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};