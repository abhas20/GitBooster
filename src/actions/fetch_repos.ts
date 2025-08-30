import { prisma } from "@/db/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

type Order = 'asc' | 'desc';

export const fetchRecentRepos = async (order:Order) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        throw new Error("Unauthorized");
    }
      const repos = await prisma.repo.findMany({
        where: { userId: session?.user.id },
        include: {
          analyses: { orderBy: { createdAt: 'desc' } }
        },
        take: 10,
        orderBy: { createdAt: order === 'asc' ? 'asc' : 'desc' },
      },
    )
    return repos;

}