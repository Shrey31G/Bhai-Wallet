"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "../auth";

export async function createOnrampTransaciton(provider: string, amount: number) {
  try {

    const token = uuidv4();
    
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    

    const transaction = await prisma.onRampTransaction.create({
      data: {
        token: token,
        provider: provider,
        status: "Processing",
        amount: amount * 100,
        startTime: new Date(),
        userId: Number(userId)
      }
    });
    

    return {
      success: true,
      token: transaction.token,
      userId: userId,
      provider: provider,
      amount: amount
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction");
  }
}