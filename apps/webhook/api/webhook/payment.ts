import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import prisma from '../../prisma/client';

const PaymentSchema = z.object({
  token: z.string(),
  userId: z.string(),
  amount: z.string()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received webhook request:', JSON.stringify(req.body));

    const parsed = PaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input format", errors: parsed.error.errors });
    }

    const { token, userId, amount } = parsed.data;

    const paymentAmount = parseInt(amount, 10);
    const webhookUserId = parseInt(userId, 10);

    const existingTransaction = await prisma.onRampTransaction.findUnique({
      where: { token }
    });

    if (!existingTransaction) {
      return res.status(400).json({ message: "Transaction not found" });
    }

    console.log('Found transaction:', existingTransaction);
    console.log('Comparing: DB amount:', existingTransaction.amount, 'Webhook amount:', paymentAmount);

 
    const isAmountMatch = existingTransaction.amount === paymentAmount;

    if (existingTransaction.userId !== webhookUserId || !isAmountMatch) {
      return res.status(400).json({ 
        message: "Transaction details mismatch",
        details: {
          userIdMatch: existingTransaction.userId === webhookUserId,
          amountMatch: isAmountMatch,
          expectedAmount: existingTransaction.amount,
          receivedAmount: paymentAmount
        }
      });
    }

    if (existingTransaction.status === "Success") {
      return res.status(200).json({ message: "Transaction already processed" });
    }

    await prisma.$transaction([
      prisma.balance.upsert({
        where: { userId: webhookUserId },
        update: { amount: { increment: paymentAmount } },
        create: { userId: webhookUserId, amount: paymentAmount, locked: 0 }
      }),
      prisma.onRampTransaction.update({
        where: { id: existingTransaction.id },
        data: { status: "Success" }
      })
    ]);

    return res.status(200).json({ message: "Payment processed successfully", token });

  } catch (error: any) {
    console.error("Payment webhook error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}