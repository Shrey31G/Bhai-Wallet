import { NextResponse } from 'next/server';

let bankBalance = 100000000;

const processedTokens = new Set<string>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, userId, amount } = body;

    if (!token || !userId || !amount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }


    if (processedTokens.has(token)) {
      return NextResponse.json({ message: 'Transaction already processed' }, { status: 400 });
    }

    if (paymentAmount > bankBalance) {
      return NextResponse.json({ message: 'Insufficient bank balance' }, { status: 400 });
    }

    bankBalance -= paymentAmount;

    processedTokens.add(token);
    
    const webhookUrl = process.env.WEBHOOK_URL || "";
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        userId,
        amount: (paymentAmount * 100).toString() 
      }),
    });

    if (!webhookResponse.ok) {

      bankBalance += paymentAmount;
      processedTokens.delete(token);
      
      const errorData = await webhookResponse.json();
      return NextResponse.json({ 
        message: 'Payment webhook failed', 
        error: errorData 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Payment successful',
      transactionId: token,
      amount: paymentAmount,
      remainingBalance: bankBalance
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}