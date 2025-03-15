// app/lib/actions/p2pTransfer.ts
"use server"

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";

import { revalidatePath } from "next/cache";
import { authOptions } from "../auth";

export async function p2pTransfer(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, message: "You must be logged in to transfer money" };
    }

    const number = formData.get('number')?.toString();
    const amount = Number(formData.get('amount'));

    if (!number) {
      return { success: false, message: "Phone number is required" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, message: "Please enter a valid amount" };
    }


    const amountInCents = Math.round(amount * 100);

    const sender = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { Balance: true }
    });

    if (!sender) {
      return { success: false, message: "Sender account not found" };
    }

    const recipient = await prisma.user.findUnique({
      where: { number: number },
    });

    if (!recipient) {
      return { success: false, message: "Recipient not found" };
    }

    const senderBalance = await prisma.balance.findUnique({
      where: { userId: sender.id }
    });

    if (!senderBalance || senderBalance.amount < amountInCents) {
      return { success: false, message: "Insufficient funds" };
    }

    await prisma.$transaction(async (tx) => {

      await tx.balance.update({
        where: { userId: sender.id },
        data: { amount: { decrement: amountInCents } }
      });


      const recipientBalance = await tx.balance.findUnique({
        where: { userId: recipient.id }
      });

      if (recipientBalance) {
        await tx.balance.update({
          where: { userId: recipient.id },
          data: { amount: { increment: amountInCents } }
        });
      } else {
        await tx.balance.create({
          data: {
            userId: recipient.id,
            amount: amountInCents,
            locked: 0
          }
        });
      }

      await tx.p2pTransfer.create({
        data: {
          fromUserId: sender.id,
          toUserId: recipient.id,
          amount: amountInCents,
          timestamp: new Date()
        }
      });
    });


    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return { 
      success: true, 
      message: `Successfully transferred ₹${amount} to ${recipient.name || recipient.number}`
    };
  } catch (error) {
    console.error("P2P transfer error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}