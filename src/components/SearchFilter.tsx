"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

type Repo = {
  id: string;
  name: string;
  owner: string;
  url: string;
  createdAt: string;
  analyses: any[];
};

type Props = {
  repos: Repo[];
  onFilter: (filtered: Repo[]) => void;
};

export default function SearchFilter({ repos, onFilter }: Props) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    filterRepos();
  }, [query, sortOrder]);

  const filterRepos = () => {
    let filtered = repos.filter((repo) =>
      repo.name.toLowerCase().includes(query.toLowerCase())
    );

    filtered = filtered.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    onFilter(filtered);
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Search your recent repos..."
        type="search"
        className="focus:border focus:border-red-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button variant="secondary" onClick={handleSortToggle}>
        Sort: {sortOrder === "asc" ? "Oldest" : "Newest"}
      </Button>
    </div>
  );
}
