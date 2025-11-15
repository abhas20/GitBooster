import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/db/prisma";
import bcrypt from 'bcrypt'
import { PrismaAdapter } from "@auth/prisma-adapter";

declare module "next-auth" {

  interface Session{
    user:{
      id:string;
      name:string|null;
      email:string|null;
      image:string|null;
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter:PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.NEXTAUTH_GITHUB_ID!,
      clientSecret: process.env.NEXTAUTH_GITHUB_SECRET!,
    }),
    CredentialsProvider({
        name: "Credentials",
        credentials:{
            email:{label:"Email",type:"text",placeholder:"Enter your email"},
            password:{label:"Password",type:"password"}
        },
        async authorize(credentials){
            if(!credentials?.email || !credentials.password){
                throw new Error("Invalid credentials")
            }
            try{
                const user=await prisma.user.findUnique({
                    where:{email:credentials.email}
                })
                if(!user){
                    throw new Error("User not found")
                }
                const isValid= await bcrypt.compare(credentials.password,user.password);
                if(!isValid){
                    throw new Error("Password Invalid")
                }
                return {
                    id:user.id,
                    email:user.email,
                    name:user.name,
                    image:user.avatarUrl || user.image || null,
                }
            }
            catch(error){
                console.error("Error in user authentication: ",error);
                throw new Error("Internal Server Error");
            }
        }
    })
  ],
  callbacks:{
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id.toString();
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
        
    },
    async session({session,token}){
      if(!token?.email) return session;

      const user= await prisma.user.findUnique({
        where:{email:token.email as string}
      });

      if(user && session.user){
        session.user.id=user.id;
        session.user.name=user.name;
        session.user.email=user.email;
        session.user.image=user.avatarUrl || user.image || null;
      }
      return session;
    }
  },
  pages:{
    error:"/error",
    signIn:"/login"
  },
  jwt:{
    maxAge:7*24*60*60, // 7 days
  },
  session:{
    strategy:"jwt",
    maxAge:30*24*60*60, // 30 days
  },
  secret:process.env.NEXTAUTH_SECRET,

};

