// app/transactions/page.tsx
import { Suspense } from 'react';

import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth';

import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import { All_transactions } from '../../../components/All_transactions';

async function getData() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return redirect('/login');
  }
  
  const transactions = await prisma.p2pTransfer.findMany({
    orderBy: {
      timestamp: 'desc'
    },
    include: {
      fromUser: {
        select: {
          name: true,
          number: true
        }
      },
      toUser: {
        select: {
          name: true,
          number: true
        }
      }
    }
  });

  return transactions;
}

export default async function TransactionsPage() {
  const transactions = await getData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      
      <Suspense fallback={<div>Loading transactions...</div>}>
        <All_transactions txns={transactions} />
      </Suspense>
    </div>
  );
}