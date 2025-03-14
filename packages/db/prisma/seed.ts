import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const ritik = await prisma.user.upsert({
        where: {
            number: '88',
        }, 
        update: {},
        create: {
            number: '88',
            password: await bcrypt.hash('ritik',10),
            name: 'ritik',
            Balance: {
                create: {
                    amount: 30000,
                    locked: 0
                }
            },
            OnRampTranscation: {
                create: {
                    startTime: new Date(),
                    status: "Success",
                    amount: 20000,
                    token: "8",
                    provider: "HDFC Bank",
                }
            }
        }
    })

    const kalu = await prisma.user.upsert({
        where: {
            number: "66",
        }, update: {},

        create: {
            number: "66",
            password: await bcrypt.hash('kalu', 10),
            name: 'kalu',
            Balance: {
                create: {
                    amount: 2000,
                    locked: 0
                }
            },
            OnRampTranscation: {
                create: {
                    startTime: new Date(),
                    status: "Failure",
                    amount: 1000,
                    token: "6",
                    provider: "HDFC Bank"
                }
            }
        }
    })
    console.log({ ritik, kalu })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })