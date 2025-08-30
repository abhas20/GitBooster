// app/repos/page.tsx
import { fetchRecentRepos } from "@/actions/fetch_repos";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RecentReposPage from "@/components/Recent";
import { Link } from "lucide-react";

export default async function RepoPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
    <p className="text-center mt-20">
      Please <Link href="/login"> Login </Link> to view your recent repositories.
    </p>
    )
  }

  const repos = await fetchRecentRepos("desc");

  return <RecentReposPage user={session.user} repos={repos} />;
}
