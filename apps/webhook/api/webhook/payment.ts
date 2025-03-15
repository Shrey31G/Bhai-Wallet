

import prisma from '@repo/db/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { token, userId, amount } = req.body;
    

    if (!token || !userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token, userId, or amount'
      });
    }

 
    const paymentUserId = parseInt(userId);
    const paymentAmount = parseInt(amount) / 100; 
    
    console.log(`Processing payment: Token=${token}, UserId=${paymentUserId}, Amount=${paymentAmount}`);


    const result = await prisma.$transaction(async (tx) => {

      const transaction = await tx.onRampTransaction.findUnique({
        where: { token }
      });


      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'Processing') {
        throw new Error(`Transaction already ${transaction.status.toLowerCase()}`);
      }

 
      if (transaction.userId !== paymentUserId) {
        throw new Error('User ID mismatch');
      }


      if (transaction.amount !== paymentAmount) {
        throw new Error('Amount mismatch');
      }

   
      const updatedTransaction = await tx.onRampTransaction.update({
        where: { token },
        data: { status: 'Success' }
      });

  
      const balance = await tx.balance.findUnique({
        where: { userId: paymentUserId }
      });

      if (!balance) {

        await tx.balance.create({
          data: {
            userId: paymentUserId,
            amount: paymentAmount,
            locked: 0
          }
        });
      } else {

        await tx.balance.update({
          where: { userId: paymentUserId },
          data: { amount: balance.amount + paymentAmount }
        });
      }

      return updatedTransaction;
    });

    return res.status(200).json({
      success: true,
      transactionId: result.id,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Payment webhook error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}