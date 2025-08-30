"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import AIDialog from "./AIDialog";
import SearchFilter from "./SearchFilter";
import DeleteButton from "./DeleteButton";

type Props = {
  user: any;
  repos: any[];
};

interface Analysis {
  id: string;
  prNumber: number;
  title: string;
  repoId: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  diffSnippet?: string;
  aiFull?: string | object;
  risk?: string;
  author?: string;
  createdAt: Date;
}

export default function RecentReposPage({ user, repos }: Props) {
  const [filteredRepos, setFilteredRepos] = useState(repos);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recent Repositories:</h1>
        <Button className="bg-sky-400 italic">
          <Link href="/">Analyse New Repo</Link>
        </Button>
      </div>

      {/* Search + Sort */}
      <SearchFilter repos={repos} onFilter={setFilteredRepos} />

      {filteredRepos.length === 0 && <p>No repositories found.</p>}

      {filteredRepos.map((repo) => (
        <div key={repo.id} className="mb-8 border rounded p-4">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-4">
            {repo.owner}/{repo.name}
            <DeleteButton
              repoId={repo.id}
              onDelete={() =>
                setFilteredRepos((prev) => prev.filter((r) => r.id !== repo.id))
              }
            />
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            URL:{" "}
            <Link
              href={repo.url}
              className="underline text-blue-500"
              target="_blank">
              {repo.url}
            </Link>
          </p>

          <AIDialog data={repo} />

          {repo.analyses.length > 0 ? (
            <ul className="space-y-2 mt-3">
              {repo.analyses.map((analysis: Analysis) => (
                <li
                  key={analysis.id}
                  className="border rounded p-3 hover:bg-muted-foreground/30 transition">
                  <details>
                    <summary className="cursor-pointer font-medium text-blue-600">
                      PR #{analysis.prNumber} - {analysis.title}
                    </summary>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <strong>Author:</strong> {analysis.author}
                      </p>
                      <p>
                        <strong>Risk:</strong> {analysis.risk}
                      </p>
                      <p>
                        <strong>Additions:</strong> {analysis.additions}
                      </p>
                      <p>
                        <strong>Deletions:</strong> {analysis.deletions}
                      </p>
                      <p>
                        <strong>Changed Files:</strong> {analysis.changedFiles}
                      </p>
                      <div>
                        <strong>Summary:</strong>
                        <div
                          className="prose prose-sm mt-1"
                          dangerouslySetInnerHTML={{
                            __html: analysis.aiFull as string,
                          }}
                        />
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No PRs analyzed yet.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
