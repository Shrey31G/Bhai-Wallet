import { NextResponse } from 'next/server';

let bankBalance = 100000000;

export async function GET() {
  return NextResponse.json({ 
    balance: bankBalance 
  });
}

export async function POST(request: Request) {
  const { operation, amount } = await request.json();
  
  if (operation === 'reset') {
    bankBalance = 100000000;
    return NextResponse.json({ balance: bankBalance, message: 'Balance reset to 10000' });
  }
  
  if (operation === 'set' && amount) {
    bankBalance = Number(amount);
    return NextResponse.json({ balance: bankBalance, message: `Balance set to ${amount}` });
  }
  
  return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
}