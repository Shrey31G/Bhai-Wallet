import  bcrypt  from 'bcrypt';
import CredentialsProvider  from 'next-auth/providers/credentials';
import db from "@repo/db/client"


export const authOptions = {
    providers: [
        CredentialsProvider({
            name:'Credentials',
            credentials: {
                phone: {label: "Phone number", type:"text", placeholder:"123456789", required: true},
                password: {label: "Password", type: "password", required: true},
                name: {label:"Your Name", type:"text", placeholder:"Bhai", required: true}
            },
            async authorize(credentials: any) {
                const hashedPassword = await bcrypt.hash(credentials.password, 10);
                const existingUser = await db.user.findFirst({
                    where: {
                        number: credentials.phone
                    }
                });

                if(existingUser) {
                    const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                    if(passwordValidation) {
                        return {
                            id: existingUser.id.toString(),
                            name: existingUser.name,
                            email: existingUser.email,
                            number: existingUser.number
                        }
                    }
                    return null;
                }

                try {
                    const user = await db.user.create({
                        data: {
                            number: credentials.phone,
                            password: hashedPassword,
                            name: credentials.name
                        }
                    });
                    await db.balance.create({
                        data: {
                            userId: user.id,
                            amount: 0,
                            locked: 0
                        }
                    })
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        number: user.number
                    }
                } catch(e) {
                    console.error(e)
                }
                return null;
            }
        })
    ],
    secret:process.env.JWT_SECRET || "secret",
    callbacks: {
        async session({token, session}: any) {
            session.user.id = token.sub
            session.user.number = token.number
            return session
        }
    }
}