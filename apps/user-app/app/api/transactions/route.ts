
import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';


export async function GET(request: Request) {
  try {

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await prisma.p2pTransfer.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 100, 
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

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { message: 'Error fetching transactions' },
      { status: 500 }
    );
  }
}