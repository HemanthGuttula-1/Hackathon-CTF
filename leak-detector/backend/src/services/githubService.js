import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("❌ GITHUB_TOKEN is required. Add it in .env");
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
  userAgent: "SecretScanner/1.0",
});

console.log("✅ GitHub client initialized");

/**
 * 🔍 Search code globally
 */
export const searchCode = async (
  query = 'extension:env OR "api_key" OR "AKIA" OR "sk_live"',
  limit = 5
) => {
  try {
    const { data } = await octokit.rest.search.code({
      q: query,
      per_page: limit,
      sort: "indexed",
      order: "desc",
    });

    return data.items.map((item) => ({
      repo: item.repository.full_name,
      path: item.path,
      url: item.html_url,
    }));
  } catch (error) {
    console.error("❌ GitHub search failed:", error.message);
    throw error;
  }
};

/**
 * 📁 Get repo tree
 */
export const getRepoTree = async (repo) => {
  try {
    const [owner, repoName] = repo.split("/");

    const repoInfo = await octokit.rest.repos.get({
      owner,
      repo: repoName,
    });

    const branch = repoInfo.data.default_branch;

    const { data } = await octokit.rest.git.getTree({
      owner,
      repo: repoName,
      tree_sha: branch,
      recursive: 1,
    });

    return data.tree
      .filter(
        (item) =>
          item.type === "blob" &&
          /\.(env|json|js|ts|config|secret|key|token)$/i.test(item.path)
      )
      .slice(0, 30);
  } catch (error) {
    console.error("❌ Repo tree error:", error.message);
    throw error;
  }
};

/**
 * 📄 Get file content
 */
export const getFileContent = async (repo, path) => {
  try {
    const [owner, repoName] = repo.split("/");

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo: repoName,
      path,
    });

    if (data.type === "file") {
      return Buffer.from(data.content, "base64").toString("utf8");
    }

    return null;
  } catch (error) {
    console.warn(`⚠️ Failed file: ${path}`);
    return null;
  }
};

/**
 * 📦 Fetch files with content (IMPORTANT)
 */
export const fetchRepoFiles = async (repo) => {
  console.log(`📦 Fetching repo files: ${repo}`);

  const tree = await getRepoTree(repo);

  // ✅ Parallel fetching (faster)
  const filePromises = tree.map(async (file) => {
    const content = await getFileContent(repo, file.path);

    if (!content || content.length < 10) return null;

    return {
      repo,
      path: file.path,
      content,
    };
  });

  const files = await Promise.all(filePromises);

  return files.filter(Boolean);
};

/**
 * 🚀 Scan specific repo (returns FILES, not findings)
 */
export const scanRepo = async (repo) => {
  try {
    const files = await fetchRepoFiles(repo);
    console.log(`✅ Repo ${repo}: ${files.length} files fetched`);
    return files;
  } catch (error) {
    console.error("❌ scanRepo error:", error.message);
    throw error;
  }
};

/**
 * 🌐 Global scan (returns FILES)
 */
export const globalScan = async (query, limit = 5) => {
  try {
    console.log(`🌐 Global search: ${query}`);

    const results = await searchCode(query, limit);

    const allFiles = [];

    for (const item of results) {
      const content = await getFileContent(item.repo, item.path);

      if (!content) continue;

      allFiles.push({
        repo: item.repo,
        path: item.path,
        content,
      });

      // ⏱️ small delay (rate limit safety)
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`✅ Global fetched: ${allFiles.length} files`);

    return allFiles;
  } catch (error) {
    console.error("❌ globalScan error:", error.message);
    throw error;
  }
};

export default {
  searchCode,
  getRepoTree,
  getFileContent,
  fetchRepoFiles,
  scanRepo,
  globalScan,
};