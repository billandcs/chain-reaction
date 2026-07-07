import { execFileSync } from "node:child_process";

const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO_NAME || "chain-reaction";
const isPrivate = (process.env.GITHUB_REPO_PRIVATE || "true").toLowerCase() !== "false";

function run(command: string, args: string[]) {
  return execFileSync(command, args, { stdio: "pipe", encoding: "utf8" }).trim();
}

async function main() {
  if (!token || !owner) {
    throw new Error("Set GITHUB_TOKEN and GITHUB_OWNER before running npm run github:init.");
  }

  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      name: repo,
      description: "Local-first personal onchain intelligence dashboard.",
      private: isPrivate,
      auto_init: false,
    }),
  });

  if (!response.ok && response.status !== 422) {
    throw new Error(`GitHub repo creation failed: ${response.status} ${await response.text()}`);
  }

  try {
    run("git", ["rev-parse", "--is-inside-work-tree"]);
  } catch {
    run("git", ["init"]);
  }

  run("git", ["add", "."]);

  try {
    run("git", ["commit", "-m", "Initial Chain Reaction scaffold"]);
  } catch {
    console.log("No new files to commit.");
  }

  const remoteUrl = `https://github.com/${owner}/${repo}.git`;
  try {
    run("git", ["remote", "set-url", "origin", remoteUrl]);
  } catch {
    run("git", ["remote", "add", "origin", remoteUrl]);
  }

  run("git", ["branch", "-M", "main"]);
  run("git", ["push", "-u", "origin", "main"]);
  console.log(`Pushed ${repo} to ${remoteUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
