import type { Env, Release } from "../types";
import { groupTimestampsByInterval } from "../utils/group-timestamps-by-interval";

interface CountResult {
	count: number;
	timestamp: number;
}

export async function count(
	env: Env,
	options: {
		repo_id: string;
		interval: number;
	},
): Promise<D1Result<CountResult>> {
	const { repo_id, interval } = options;

	const releases = await env.DB.prepare(
		`SELECT published_at
     FROM releases
     WHERE repo_id = ?`,
	)
		.bind(repo_id)
		.all<Release>();

	if (!releases.success) {
		return {
			...releases,
			results: [],
		};
	}

	const releaseTimestamps = releases.results.map((release) =>
		new Date(release.published_at).getTime(),
	);

	const grouped = groupTimestampsByInterval(releaseTimestamps, interval);

	return {
		...releases,
		results: grouped,
	};
}

export async function insert(env: Env, release: Release): Promise<void> {
	await env.DB.prepare(
		`INSERT OR IGNORE INTO releases (
      node_id, repo_id, tag_name, target_commitish, name, draft, prerelease,
      created_at, published_at, repo_id, url, assets_url, upload_url, html_url,
      tarball_url, zipball_url, body, author_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
	)
		.bind(
			release.node_id,
			release.url.split("/").slice(-4, -2).join("/"),
			release.tag_name,
			release.target_commitish,
			release.name,
			release.draft ? 1 : 0,
			release.prerelease ? 1 : 0,
			release.created_at,
			release.published_at,
			release.repo_id,
			release.url,
			release.assets_url,
			release.upload_url,
			release.html_url,
			release.tarball_url,
			release.zipball_url,
			release.body,
			release.author_id,
		)
		.run();
}

export async function getLast(
	env: Env,
	repo_id: string,
): Promise<Release | null> {
	return await env.DB.prepare(
		"SELECT * FROM releases WHERE repo_id = ? ORDER BY published_at DESC LIMIT 1;",
	)
		.bind(repo_id)
		.first();
}
