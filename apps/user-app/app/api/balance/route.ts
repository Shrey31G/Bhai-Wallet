
import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { NextResponse } from "next/server";
import { authOptions } from "../../lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await prisma.balance.findFirst({
      where: {
        userId: Number(session.user.id)
      }
    });

    return NextResponse.json({
      amount: balance?.amount || 0,
      locked: balance?.locked || 0
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}