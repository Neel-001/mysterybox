import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            // Removed unused @ts-expect-error directives as there is no longer a TypeScript error here.
            // @ts-expect-error: NextAuth expects a plain object, but Mongoose returns a Document. This is a safe and common workaround.
            async authorize(credentials: Record<"email" | "password", string> | undefined) {
                if (!credentials) return null;
                await dbConnect();
                try {
                    const identifier = credentials.email;
                    const user = await UserModel.findOne({
                        $or: [
                            { email: identifier },
                            { username: identifier },
                        ]
                    });
                    if (!user) {
                        throw new Error("No user found with this email");
                    }
                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login");
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error("Invalid password");
                    }
                } catch (err: unknown) {
                    throw err;
                }
            }
        })
    ],
    callbacks : {
        async jwt({token,user}){
            if(user){
            token._id = user._id?.toString();
            token.isVerified = user.isVerified;
            token.isAcceptingMessage = user.isAcceptingMessage;
            token.username = user.username;
            }
            return token
        },
        async session({session,token}){
            if(session){
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessage = token.isAcceptingMessage;
                session.user.username = token.username;
            }
            return session;
        },
    },
    pages:{
        signIn : '/sign-in'
    },
    session : {
        strategy : "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
}