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

    console.log('Webhook URL:', process.env.WEBHOOK_URL);
    
    if (!process.env.WEBHOOK_URL) {
      return NextResponse.json({ message: 'Webhook URL not configured' }, { status: 500 });
    }

    try {

      const webhookData = {
        token,
        userId,
        amount: String(paymentAmount)
      };

      console.log('Sending webhook data:', webhookData);

      const webhookResponse = await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      const responseText = await webhookResponse.text();
      console.log('Webhook response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse webhook response:', e);
      }

      if (!webhookResponse.ok) {
        bankBalance += paymentAmount;
        processedTokens.delete(token);
        
        return NextResponse.json({
          message: 'Payment webhook failed',
          error: responseData || responseText
        }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Payment successful',
        transactionId: token,
        amount: paymentAmount,
        remainingBalance: bankBalance
      });

    } catch (fetchError) {
      bankBalance += paymentAmount;
      processedTokens.delete(token);
      
      return NextResponse.json({
        message: 'Failed to connect to payment webhook',
        error: fetchError instanceof Error ? fetchError.message : String(fetchError)
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}