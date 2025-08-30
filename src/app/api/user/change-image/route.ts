import { prisma } from "@/db/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export interface NewImage {
  imageUrl: string;
}

export async function POST(req:NextRequest){
    try {
        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            return new Response(JSON.stringify({error:"Unauthorised"}),{status:401})
        }
        const res:NewImage= await req.json();
        if(!res || !res.imageUrl){
            return new Response(JSON.stringify({error:"Image URL is required"}),{status:400})
        }
        const data=await prisma.user.update({
            where:{
                id:session.user.id,
                email:session.user.email || undefined,
            },
            data:{
                avatarUrl:res.imageUrl
            },
        })
        return NextResponse.json({
            message:"User updated successfully",
            user:data
        },{status:200})


    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
    
}