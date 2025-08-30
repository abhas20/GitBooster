import { aiAnalysis } from "@/actions/ai_action";
import { prisma } from "@/db/prisma";
import { authOptions } from "@/lib/auth";
import { fetchGitHub } from "@/lib/github";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest, context: any) {
  try {
    const { params } = context as { params: { id: string; number: string } };
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!session || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // const {aiRes}= await req.json();

    const [owner, repo] = params.id.split("@");
    const prNumber = parseInt(params.number, 10); // Convert string to integer
    if (!owner || !repo || isNaN(prNumber)) {
      throw new Error("Invalid repository identifier");
    }
    const account = await prisma.account.findFirst({
      where: {
        type: "oauth",
        provider: "github",
        user: { email: email },
      },
    });
    const userToken = account?.access_token;

    const pr = await fetchGitHub(
      `GET /repos/${owner}/${repo}/pulls/${prNumber}`,
      userToken,
      {
        owner: owner,
        repo: repo,
        pull_number: prNumber,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    const diff = await fetchGitHub(
      `GET /repos/${owner}/${repo}/pulls/${prNumber}`,
      userToken,
      {
        owner: owner,
        repo: repo,
        pull_number: prNumber,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
          Accept: "application/vnd.github.v3.diff",
        },
        mediaType: { format: "diff" },
      }
    );
    if (!pr || !diff) {
      throw new Error("Failed to fetch PRs or diff from GitHub");
    }
    const data = { pr, diff };
    console.log(data);
    const aiRes = await aiAnalysis(data, [
      "Generate a concise summary of the changes made in this pull request and also state the risk level of merging this PR in as 'RISK In Merging:' between high, medium, low.",
    ]);

    const existingRepo = await prisma.repo.findFirst({
      where: {
        owner: owner,
        name: repo,
      },
    });
    if (existingRepo) {
      const existingAnalysis = await prisma.analysis.findFirst({
        where: {
          repoId: existingRepo?.id,
          prNumber: prNumber,
        },
      });
      if (existingAnalysis) {
        await prisma.analysis.update({
          where: { id: existingAnalysis.id },
          data: {
            diffSnippet: diff.split("\n").slice(0, 50).join("\n"),
            aiFull: aiRes,
            risk: aiRes.includes("RISK In Merging:")
              ? aiRes.split("RISK In Merging:")[1].split(".")[0].trim()
              : "Unknown",
            additions: pr.additions,
            deletions: pr.deletions,
            changedFiles: pr.changed_files,
          },
        });
        return NextResponse.json({ pr, diff, aiRes });
      }
    }
    const riskMatch = aiRes.match(/RISK In Merging:\s*(high|medium|low)/i);
    const risk = riskMatch ? riskMatch[1].toLowerCase() : "unknown";

    await prisma.analysis.create({
      data: {
        prNumber: prNumber || 0,
        repoId: existingRepo?.id || "",
        title: pr.title,
        author: pr.user.login,
        diffSnippet: diff.substring(0, 1000),
        aiFull: aiRes,
        risk: risk,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
      },
    });

    return NextResponse.json({ pr, diff, aiRes });
  } catch (error: any) {
    console.error("Error in PR analysis:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}