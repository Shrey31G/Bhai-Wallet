"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const ritik = await prisma.user.upsert({
        where: {
            number: '88',
        },
        update: {},
        create: {
            number: '88',
            password: await bcrypt_1.default.hash('ritik', 10),
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
    });
    const kalu = await prisma.user.upsert({
        where: {
            number: "66",
        }, update: {},
        create: {
            number: "66",
            password: await bcrypt_1.default.hash('kalu', 10),
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
    });
    console.log({ ritik, kalu });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
