import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from "@repo/db/client";
import { z } from "zod";

const PaymentSchema = z.object({
  token: z.string(),
  userId: z.string(),
  amount: z.string()
});

const processedTokens = new Set<string>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Received webhook request:', JSON.stringify(req.body));

  try {
    const parsed = PaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error.errors);
      return res.status(400).json({ message: "Invalid input format", errors: parsed.error.errors });
    }

    const { token, userId, amount } = parsed.data;


    if (processedTokens.has(token)) {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    const paymentAmount = parseFloat(amount) / 100;
    const webhookUserId = parseInt(userId, 10);

    const existingTransaction = await prisma.onRampTransaction.findUnique({
      where: { token }
    });

    if (!existingTransaction) {
      console.error('Transaction not found:', token);
      return res.status(400).json({ message: "Transaction not found" });
    }

    console.log('Found transaction:', existingTransaction);

    const amountDifference = Math.abs(existingTransaction.amount - paymentAmount);
    const isAmountMatch = amountDifference < 1; 

    if (existingTransaction.userId !== webhookUserId || !isAmountMatch) {
      console.error('Transaction mismatch:', {
        expected: { userId: existingTransaction.userId, amount: existingTransaction.amount },
        received: { userId: webhookUserId, amount: paymentAmount }
      });
      return res.status(400).json({ message: "Transaction details mismatch" });
    }

    if (existingTransaction.status === "Success") {
      console.log('Transaction already processed:', token);
      return res.status(200).json({ message: "Transaction already processed" });
    }

    console.log('Updating balance and marking transaction as successful');

    await prisma.$transaction([
      prisma.balance.upsert({
        where: { userId: webhookUserId },
        update: { amount: { increment: paymentAmount } },
        create: { userId: webhookUserId, amount: paymentAmount * 100, locked: 0 }
      }),
      prisma.onRampTransaction.update({
        where: { id: existingTransaction.id },
        data: { status: "Success" }
      })
    ]);

    processedTokens.add(token);

    console.log('Transaction completed successfully');

    return res.status(200).json({
      message: "Payment processed successfully",
      token
    });

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
