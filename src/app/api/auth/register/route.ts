import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt'

export async function POST(request:NextRequest){
    try {

        const {name,email,password}=await request.json()
        if(!email || !name || !password){
            let missing:string[]=[]
            if(!email) missing.push("email")
            if(!name) missing.push("name")
            if(!password) missing.push("password")
            return NextResponse.json(
                {error:{"message":`${missing.join(",")} are required`, status:400}},
                {status:400},
            )
        }
        
    const providedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: providedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            message: "User already exists",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        email: providedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error:{"message":"Internal Server Error", status:500}
        })
    }
}