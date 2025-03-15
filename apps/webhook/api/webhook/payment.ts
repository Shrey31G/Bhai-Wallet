
import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from "@repo/db/client";
import { z } from "zod";

const PaymentSchema = z.object({
  token: z.string(),
  userId: z.string(),
  amount: z.string()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Received webhook request with body:', JSON.stringify(req.body));
  
  try {
    const parsed = PaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error.errors);
      return res.status(400).json({ message: "Invalid input format", errors: parsed.error.errors });
    }
    
    const paymentInformation = {
      token: req.body.token,
      userId: req.body.userId,
      amount: req.body.amount
    };
    
    console.log('Processing payment information:', paymentInformation);
    
    try {
      const existingTransaction = await prisma.onRampTransaction.findUnique({
        where: {
          token: paymentInformation.token,
        }
      });
      
      if (!existingTransaction) {
        console.error('Transaction not found for token:', paymentInformation.token);
        return res.status(400).json({ message: "Transaction not found" });
      }
      
      console.log('Found existing transaction:', existingTransaction);
      
      const webhookAmount = parseFloat(paymentInformation.amount) / 100; 
      const webhookUserId = parseInt(paymentInformation.userId, 10);
      
      console.log('Normalized values for comparison:', {
        webhookAmount,
        webhookUserId,
        existingAmount: existingTransaction.amount,
        existingUserId: existingTransaction.userId
      });

      const amountDifference = Math.abs(existingTransaction.amount - webhookAmount);
      const isAmountMatch = amountDifference < 1; 
      
      if (
        existingTransaction.userId !== webhookUserId ||
        !isAmountMatch
      ) {
        console.error('Transaction mismatch:', {
          existingUserId: existingTransaction.userId,
          webhookUserId,
          existingAmount: existingTransaction.amount,
          webhookAmount,
          difference: amountDifference
        });
        return res.status(400).json({ 
          message: "Transaction details mismatch",
          expected: {
            userId: existingTransaction.userId,
            amount: existingTransaction.amount
          },
          received: {
            userId: webhookUserId,
            amount: webhookAmount,
            originalAmount: paymentInformation.amount
          }
        });
      }
      
      if (existingTransaction.status === "Success") {
        console.log('Transaction already processed:', paymentInformation.token);
        return res.status(200).json({ message: "Transaction already processed" });
      }
      
      console.log('Updating balance and transaction status');
      
      await prisma.$transaction([
        prisma.balance.upsert({
          where: {
            userId: webhookUserId
          },
          update: {
            amount: {
              increment: webhookAmount 
            }
          },
          create: {
            userId: webhookUserId,
            amount: webhookAmount * 100, 
            locked: 0
          }
        }),
        prisma.onRampTransaction.update({
          where: {
            id: existingTransaction.id
          },
          data: {
            status: "Success"
          }
        })
      ]);
      
      console.log('Transaction completed successfully');
      
      return res.status(200).json({
        message: "Payment processed successfully",
        token: paymentInformation.token
      });
      
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        message: "Database error while processing webhook",
        error: dbError.message
      });
    }
    
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({
      message: "Error while processing webhook",
      error: error.message
    });
  }
}