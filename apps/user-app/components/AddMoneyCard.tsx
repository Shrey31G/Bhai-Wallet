"use client"

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/Select";
import { TextInput } from "@repo/ui/TextInput";
import { useState } from "react";
import { DollarSign, CreditCard, AlertCircle, ArrowRight } from "lucide-react";
import { createOnrampTransaciton } from "../app/lib/actions/createOnrampTransaction";

const SUPPORTED_BANKS = [
    {
        name: "FakeBank",
        redirectUrl: process.env.NEXT_PUBLIC_FAKE_BANK_URL
    }
];

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    
    const handleAddMoney = async () => {
        setError(null);
        if (!value.trim() || isNaN(Number(value)) || Number(value) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        try {
            setLoading(true);

            const transactionData = await createOnrampTransaciton(provider, Number(value));

            let finalRedirectUrl = redirectUrl;

            if (provider === "FakeBank") {
                finalRedirectUrl = `${redirectUrl}?token=${transactionData.token}&userId=${transactionData.userId}&amount=${value}`;
            }

            const width = 800;
            const height = 600;

            const left = (window.screen.width / 2) - (width / 2);
            const top = (window.screen.height / 2) - (height / 2);

            window.open(
                finalRedirectUrl,
                'BankRedirect',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no`
            );
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card title="Add Money">
            <div className="p-4 sm:p-6">


                {error && (
                    <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <TextInput
                            label="Amount to Add"
                            type="number"
                            placeholder="Enter amount"
                            value={value}
                            onChange={(val) => {
                                setValue(val);
                            }}
                        />
                        <div className="mt-1 text-sm text-gray-500">
                            Min amount: ₹1.00
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Bank
                        </label>
                        <Select
                            onSelect={(value) => {
                                setRedirectUrl(SUPPORTED_BANKS.find(x => x.name === value)?.redirectUrl || "")
                                setProvider(SUPPORTED_BANKS?.find(x => x.name === value)?.name || "")
                            }}
                            options={SUPPORTED_BANKS.map(x => ({
                                key: x.name,
                                value: x.name
                            }))}
                        />
                    </div>

                    <div className="border-t border-purple-100 pt-4 sm:pt-6 mt-4 sm:mt-6">
                        <div className="flex flex-col space-y-3 sm:space-y-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Service fee</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span>Total amount</span>
                                <span className="text-purple-700">{value ? `₹${Number(value).toFixed(2)}` : '₹0.00'}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleAddMoney}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                Add Money
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                        )}
                    </Button>

                    <div className="text-xs text-center text-gray-500">
                        Secure transaction powered by our banking partners
                    </div>
                </div>
            </div>
        </Card>
    );
};