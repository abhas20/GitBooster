import { prisma } from "@/db/prisma";
import { authOptions } from "@/lib/auth";
import { fetchGitHub } from "@/lib/github";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


//GET /repos/{owner}/{repo}
export async function POST(req: Request, context: any) {
    try {
        const { params } = context as { params: { id: string } };
        const session = await getServerSession(authOptions);
        const email = session?.user?.email;
        if (!session || !email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const [owner,repo]= id.split('@');
        if(!owner || !repo) {
            throw new Error("Invalid repository identifier");
        }
        const account=await prisma.account.findFirst({
            where:{
                type:"oauth",
                provider:"github",
                user: { email: email }
            }
        })
    
        const userToken =
          account?.access_token || process.env.NEXTAUTH_GITHUB_TOKEN;
        const prs = await fetchGitHub(`GET /repos/${owner}/${repo}/pulls`,userToken,{
            owner: owner,
            repo: repo,
            state:"open",
            headers:{
                "X-GitHub-Api-Version": "2022-11-28"
            }
        });
        if(!prs) {
            throw new Error("Failed to fetch PRs from GitHub");
        }
        // console.log(prs);
    
        return NextResponse.json(prs);
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Internal Server Error"},{status:500});
    }

}