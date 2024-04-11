import type { Env, Author } from "../types";

export async function getById(
	env: Env,
	author_id: string,
): Promise<Author | null> {
	return await env.DB.prepare("SELECT * FROM authors WHERE node_id = ?")
		.bind(author_id)
		.first<Author>();
}

export async function insert(env: Env, author: Author): Promise<void> {
	await env.DB.prepare(
		`INSERT OR IGNORE INTO authors (
      node_id, login, avatar_url, gravatar_id, url, html_url, followers_url,
      following_url, gists_url, starred_url, subscriptions_url, organizations_url,
      repos_url, events_url, received_events_url, type, site_admin
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
	)
		.bind(
			author.node_id,
			author.login,
			author.avatar_url,
			author.gravatar_id,
			author.url,
			author.html_url,
			author.followers_url,
			author.following_url,
			author.gists_url,
			author.starred_url,
			author.subscriptions_url,
			author.organizations_url,
			author.repos_url,
			author.events_url,
			author.received_events_url,
			author.type,
			author.site_admin ? 1 : 0,
		)
		.run();
}
