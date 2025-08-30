import { prisma } from "@/db/prisma";
import { authOptions } from "@/lib/auth";
import { parseRepo, repoValidator } from "@/lib/validator";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export const POST = async (req: Request) => {

    try {
        const session=await getServerSession(authOptions);
        if(!session){
            return new Response(JSON.stringify({error:"Unauthorized"}),{status:401});
        }
        const userId=session.user?.id;
        if(!userId){
            return new Response(JSON.stringify({error:"Unauthorized"}),{status:401});
        }

        const body = await req.json();
        repoValidator.parse(body);
        const { owner, repo } = parseRepo(body.url) || {};

        if (!owner || !repo || !body.url) {
            return new Response(JSON.stringify({ error: "Invalid GitHub repository URL" }), { status: 400 });
        }
        const existingRepo = await prisma.repo.findUnique({
            where: { url: body.url },
        })
        if (existingRepo) {
            return new Response(JSON.stringify("Repo already exists"), { status: 400 });
        }
        const newRepo = await prisma.repo.create({
            data: {
                name: repo,
                owner:owner,
                fullName: `${owner}/${repo}`,
                url: body.url,
                userId:userId
            }
        });

        return NextResponse.json(newRepo, { status: 201 });

        
    } catch (error:any) {
        console.log(error);
        if (error.name === "ZodError") {
          return new Response(JSON.stringify({ error: error.errors }), {
            status: 400,
          });
        }
        return new Response(JSON.stringify({error: "Internal Server Error"}), {status:500});
    }
}