import { Octokit } from "octokit";

export async function fetchGitHub(
  endpoint: string,
  userToken?: string | null,
  params: Record<string, any> = {}
) {
  const token = userToken || process.env.NEXTAUTH_GITHUB_TOKEN;

  if (!token) {
    throw new Error("GitHub token is not provided");
  }

  const octokit = new Octokit({ auth: token });
  console.log("Requesting:", endpoint, params);

  try {
    const response = await octokit.request(endpoint, params);

    if (response.status >= 400) {
      throw new Error(`GitHub API error: ${response.status} - ${response.url}`);
    }
    // console.log("Response:(from github.ts)", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Error fetching from GitHub:", error.message || error);
    throw error; 
  }
}
