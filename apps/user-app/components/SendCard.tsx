"use client"

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/Center";
import { TextInput } from "@repo/ui/TextInput";
import { useState } from "react";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        setError(null);
        setSuccess(false);

        if (!number.trim()) {
            setError("Please enter a phone number");
            return;
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('number', number);
        formData.append('amount', amount);

        try {
            const result = await p2pTransfer(formData);

            if (result.success) {
                setNumber("");
                setAmount("");
                setSuccess(true);
                setError(null);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="h-[90vh]">
            <Center>
                <Card title="Send Money">
                    <div>
                        <div className="mt-2 mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                            <p className="mt-1 text-sm">Need someone else to send money to? Try user ID: 88</p>
                        </div>
                        {error && (
                            <div className="mt-2 mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mt-2 mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                                <p className="font-medium">Transfer successful!</p>
                                <p className="mt-2">Check your <a href="/transactions" className="text-green-800 underline font-medium">transactions page</a> to view details.</p>
                            </div>
                        )}
                        <TextInput
                            placeholder="Phone Number"
                            label="To :"
                            value={number}
                            onChange={(value) => setNumber(value)}
                        />
                        <TextInput
                            placeholder="Amount"
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(value) => setAmount(value)}
                        />
                        <div className="pt-4 flex justify-center">
                            <Button
                                onClick={handleSend}
                            >
                                {isLoading ? "Sending..." : "Send"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </Center>
        </div>
    )
}