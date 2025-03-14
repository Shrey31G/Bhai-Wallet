"use server"

import prisma from "@repo/db/client";

export default async function getUsersTxn() {
    try {
        console.log("Fetching transactions...");
        
        const transactions = await prisma.p2pTransfer.findMany({
            orderBy: {
                timestamp: 'desc'
            }, include: {
                fromUser: {
                    select: {
                        number: true
                    }
                },
                toUser: {
                    select: {
                        number: true
                    }
                }
            }
        });

        console.log("Transactions found:", transactions.length);
        
        return transactions.map(t => ({
            time: t.timestamp,
            from: Number(t.fromUser?.number),
            to: Number(t.toUser?.number),
            amount: t.amount,
            id: t.id
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}