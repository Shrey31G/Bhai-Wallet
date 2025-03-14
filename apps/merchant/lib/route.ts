import db from '@repo/db/client';
import { Account, NextAuthOptions, User } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        })
    ],
    callbacks: {
        async signIn({user, account}: {
            user: User; account: Account | null
        }) {
            console.log("hi signin")
            if(!user || !user.email || !account) {
                return false;
            }
            
            await db.merchant.upsert({
                select: {
                    id: true
                }, 
                where: {
                    email: user.email
                },
                create: {
                    email: user.email,
                    name: user.name,
                    auth_type: account.provider === "google" ? "Google" : "Github"
                },
                update: {
                    name: user.name,
                    auth_type: account.provider === "google" ? "Github" : "Github"
                }
            });
            return true;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "secret"
}