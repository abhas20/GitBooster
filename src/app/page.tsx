'use client';
import PrDetail from "@/components/PrDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {motion} from 'framer-motion'
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prs, setPrs] = useState<any[]>([]);
  const [repoLink, setRepoLink] = useState<string>("");

  const parseRepoId = (link: string) => {
    try {
      const url = new URL(link);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0]}@${parts[1]}`; // "ownerName/repoName" to "ownerName-repoName"
      }
    } catch (err) {
      return null;
    }
    return null;
  };


  const parsedId = parseRepoId(repoLink);
  const handleFetchPRs = async () => {
    setLoading(true);
    setError(null);

    if (!parsedId) {
      setError("Invalid GitHub repository link.");
      toast.error("Invalid GitHub repository link.", {
        duration: 2000,
        position: "top-center",
      });
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/repo",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({url:repoLink})
      })

      const res= await fetch(`/api/repo/${parsedId}/prs`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({repoLink})
      })

      if (!res.ok) {
        throw new Error("Failed to fetch PRs");
      }
      const data = await res.json();
      console.log(data);
      setPrs(data);

      
    } catch (error) {
      console.log(error);
      setError("Failed to fetch PRs. Please try again.");
      toast.error("Failed to fetch PRs. Please try again.", {
        duration: 2000,
        position: "top-center",
      })
    }
    finally {
      setLoading(false);
    }
  }

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleFetchPRs();
        }
      };

  return (
    <main className="flex flex-col items-center p-6 min-h-screen">
      <motion.h1
        className="text-3xl font-extrabold mb-6 text-foreground"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        AI PR Preview
      </motion.h1>

      <motion.div
        className="relative flex gap-2 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}>
        <div className="relative w-[400px] h-[320px] rounded-xl p-1">
          <div aria-hidden className="absolute inset-0 rounded-xl z-0" />

          {/* Actual interactive card content sits above everything (z-20) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative z-20 flex flex-col items-center gap-10 w-full rounded-lg p-8
                     text-slate-900 dark:text-white border border-orange-400">
            <Input
              type="text"
              placeholder="Enter GitHub repo link"
              className="border rounded px-3 py-3 w-full text-slate-900 dark:text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={repoLink}
              onKeyDown={handleKeyDown}
              onChange={(e) => setRepoLink(e.target.value)}
            />
            <div className="flex gap-6 w-full justify-between mt-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleFetchPRs}
                  disabled={loading}
                 className="border border-amber-300 rounded px-6 py-3 hover:bg-blue-700 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Fetching..." : "Fetch PRs"}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link href="/recents">
                  <Button
                    variant="outline"
                    className="italic border border-amber-300 rounded px-6 py-3">
                    Go to Recents
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* PR List */}
      <PrDetail prs={prs} parsedId={parsedId} />
    </main>
  );

}
