"use server";
import { prisma } from "@/db/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";


const deleteRepo = async (repoId: string) => {
    try {
        
        const session = await getServerSession(authOptions);
        const email = session?.user?.email;
        if (!session || !email) {
            throw new Error("Unauthorized");
        }
        await prisma.repo.delete({
            where:{
                id:repoId,
                user: { email: email }
            }
        })
        return { success: true };

    } catch (error) {
        console.log("Error deleting repository: ", error);
        throw new Error("Failed to delete repository");
    }
}

export default deleteRepo;