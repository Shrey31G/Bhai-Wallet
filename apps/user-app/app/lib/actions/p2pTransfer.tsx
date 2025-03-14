'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client";

type TransferResult = {
    message: string;
    success: boolean;
}

export async function p2pTransfer(formData: FormData): Promise<TransferResult> {

    const to = formData.get('number') as string;
    const amountStr = formData.get('amount') as string;
    const amount = Math.round(Number(amountStr) * 100);

    const session = await getServerSession(authOptions);
    const from = session?.user?.id;

    if (!from) {
        return {
            message: "Unauthorized. Please log in.",
            success: false
        };
    }

    try {
        const toUser = await prisma.user.findFirst({
            where: { number: to }
        });

        if (!toUser) {
            return {
                message: "Recipient not found",
                success: false
            };
        }


    if (toUser.id === Number(from)) {
        return {
            message: "Cannot send money to yourself",
            success: false
        };
    }

    const result = await prisma.$transaction(async (tx) => {
 
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE;`;

        const fromBalance = await tx.balance.findUnique({
            where: { userId: Number(from) }
        });

        if (!fromBalance || fromBalance.amount < amount) {
            throw new Error('Insufficient funds');
        }

        await tx.balance.upsert({
            where: { userId: Number(toUser.id) },
            update: { amount: { increment: amount } },
            create: {
                userId: Number(toUser.id),
                amount: amount,
                locked: 0
            }
        });

        await tx.balance.update({
            where: { userId: Number(from) },
            data: { amount: { decrement: amount } }
        });


        await tx.p2pTransfer.create({
            data: {
                fromUserId: Number(from),
                toUserId: Number(toUser.id),
                amount: amount,
                timestamp: new Date()
            }
        });

        return {
            message: "Transfer successful",
            success: true
        };
    });

    return result;
} catch (error) {
    console.error('Transfer error:', error);
    return {
        message: error instanceof Error ? error.message : "Transfer failed",
        success: false
    };
}
}