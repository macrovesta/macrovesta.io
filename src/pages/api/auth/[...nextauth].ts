// import NextAuth from "next-auth";
// import { authOptions } from "~/server/auth";

// export default NextAuth(authOptions);

import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createTransport } from "nodemailer";

import { env } from "../../../env.mjs";
import { prisma } from "../../../server/db";
import { text, html, } from "../../../components/nextAuthCustom/verificationEmail"

type ExtendedSession<T> = T & {
    role: string | null;
    submittedSurvey: boolean | null;
}

export const authOptions: NextAuthOptions = {
    // Include user.id on session
    callbacks: {
        // session({ session, user }) {
        //   if (session.user) {
        //     session.user.id = user.id;
        //   }
        //   return session;
        // },

        // @ts-expect-error
        async session({ session, token, user }) {
            if (!session) return;
            if (!session.user) return;
            const userData = await prisma.user.findUnique({
                where: {
                    email: session.user.email ?? undefined
                }
            });
            let extendedSession: ExtendedSession<typeof session> = {
                ...session,
                role: null,
                submittedSurvey: null
            }
            extendedSession.role = userData?.role ?? null;
            extendedSession.submittedSurvey = userData?.submittedSurvey ?? null;

            return extendedSession
            // return {
            //   session: {
            //     user: {
            //       id: userData?.id,
            //       venue: userData?.venue,
            //       email: userData?.email
            //     }
            //   }
            // };
            // async session({ session, token, user }) {
            //   // Send properties to the client, like an access_token and user id from a provider.
            //   session.accessToken = token.accessToken
            //   session.user.id = token.id

            //   return session
            // }



        },
    },
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
            sendVerificationRequest: async ({ identifier: email, url, provider, theme }) => {
                const { host } = new URL(url)
                // NOTE: You are not required to use `nodemailer`, use whatever you want.
                // const transport = createTransport(provider.server)
                const transport = createTransport({
                    service: "gmail",
                    auth: {
                        type: "OAuth2",
                        user: process.env.NODEMAILER_EMAIL,
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET,
                        refreshToken: process.env.REFRESH_TOKEN,
                    },
                })
                const result = await transport.sendMail({
                    to: email,
                    from: provider.from,
                    subject: `Sign in to ${host}`,
                    text: text({ url, host }),
                    html: html({ url, host }),
                })
                const failed = result.rejected.concat(result.pending).filter(Boolean)
                if (failed.length) {
                    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
                }
            }

        }),
        // GoogleProvider({
        //   clientId: process.env.GOOGLE_CLIENT_ID,
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET
        // })
        // DiscordProvider({
        //   clientId: env.DISCORD_CLIENT_ID,
        //   clientSecret: env.DISCORD_CLIENT_SECRET,
        // }),
        // ...add more providers here
    ],
    pages: {
        signIn: '/auth/signin',
        // signOut: '/auth/signout',
        // // error: '/auth/error', // Error code passed in query string as ?error=
        // verifyRequest: '/auth/verify-request', // (used for check email message)
        // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    }
};

export default NextAuth(authOptions);

