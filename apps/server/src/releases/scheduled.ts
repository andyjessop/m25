import type { Env, GitHubRelease, Release } from "../types";
import * as releases from "../db/releases";
import * as authors from "../db/authors";

export async function updateReleases(env: Env, repo_id: string) {
	try {
		const lastEntry = await releases.getLast(env, repo_id);
		const githubReleases = await fetchReleases(env.GITHUB_API_KEY, lastEntry);

		for (const githubRelease of githubReleases) {
			const { author, ...rest } = githubRelease;

			const release = {
				...rest,
				author_id: author.node_id,
				repo_id,
			};

			await authors.insert(env, author);
			await releases.insert(env, release);
		}

		console.log("Releases fetched and added to the database successfully.");
	} catch (error) {
		console.error("Error updating releases:", error);
	}
}

async function fetchReleases(
	apiKey: string,
	lastEntry: Release | null,
): Promise<GitHubRelease[]> {
	let page = 1;
	const releases: GitHubRelease[] = [];

	while (true) {
		const response = await fetch(
			`https://api.github.com/repos/cloudflare/workers-sdk/releases?page=${page}&per_page=100`,
			{
				headers: {
					Accept: "application/vnd.github+json",
					Authorization: `Bearer ${apiKey}`,
					"X-GitHub-Api-Version": "2022-11-28",
					"User-agent": "m26",
				},
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentType = response.headers.get("content-type");
		if (contentType?.includes("application/json")) {
			const data = (await response.json()) as GitHubRelease[];

			for (const release of data) {
				if (lastEntry && release.id === lastEntry.id) {
					return releases;
				}
				releases.push(release);
			}

			if (data.length < 100) {
				break;
			}

			page++;
		} else {
			console.log("Response is not in JSON format");
			break;
		}
	}

	return releases;
}
