import express, { Request, Response, NextFunction } from "express";
import db from "@repo/db/client";
import prisma from "@repo/db/client";
import { z } from "zod";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors({
    origin: ['https://bhai-wallet-fake-bank.vercel.app', 'http://localhost:3004'],
    methods: ['POST'],
    credentials: true
}));

const PaymentSchema = z.object({
    token: z.string(),
    userId: z.string(),
    amount: z.string()
})


app.post("/bankWebhook", handleWebhook);

async function handleWebhook(req: Request, res: Response) {

    const parsed = PaymentSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid input format", errors: parsed.error.errors });
        return;
    }

    console.log('Received webhook request:', req.body);

    const paymentInformation: {
        token: string;
        userId: string;
        amount: string
    } = {
        token: req.body.token,
        userId: req.body.userId,
        amount: req.body.amount
    };

    try {
        const existingTransaction = await prisma.onRampTransaction.findUnique({
            where: {
                token: paymentInformation.token,
            }
        });

        if (!existingTransaction) {
            res.status(400).json({ message: "Transaction not found" });
            return;
        }

        if (
            existingTransaction.userId !== Number(paymentInformation.userId) ||
            existingTransaction.amount !== Number(paymentInformation.amount)
        ) {
            res.status(400).json({ message: "Transaction details mismatch" });
            return;
        }

        if (existingTransaction.status === "Success") {
            res.status(200).json({ message: "Transaction already processed" });
            return;
        }

        await db.$transaction([
            db.balance.upsert({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                update: {
                    amount: {
                        increment: Number(paymentInformation.amount)
                    }
                },
                create: {
                    userId: Number(paymentInformation.userId),
                    amount: Number(paymentInformation.amount),
                    locked: 0
                }
            }),
            db.onRampTransaction.update({
                where: {
                    id: existingTransaction.id
                },
                data: {
                    status: "Success"
                }
            })
        ]);

        res.json({
            message: "Payment processed successfully",
            token: paymentInformation.token
        });
    } catch (error: any) {
        console.error('Detailed webhook error:', error);
        res.status(500).json({
            message: "Error while processing webhook",
            error: error.message
        });
    }
}

export default app;