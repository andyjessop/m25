import type { Env } from "../types";

export async function seedDb(env: Env): Promise<boolean> {
	// Drop tables if they exist
	await env.DB.prepare("DROP TABLE IF EXISTS releases;").run();
	await env.DB.prepare("DROP TABLE IF EXISTS repos;").run();
	await env.DB.prepare("DROP TABLE IF EXISTS authors;").run();

	// Create tables
	await env.DB.prepare(
		`CREATE TABLE IF NOT EXISTS releases (
      id INTEGER,
      node_id TEXT PRIMARY KEY,
      repo_id TEXT,
      tag_name TEXT,
      target_commitish TEXT,
      name TEXT,
      draft INTEGER,
      prerelease INTEGER,
      created_at TEXT,
      published_at TEXT,
      url TEXT,
      assets_url TEXT,
      upload_url TEXT,
      html_url TEXT,
      tarball_url TEXT,
      zipball_url TEXT,
      body TEXT,
      author_id TEXT,
      FOREIGN KEY (repo_id) REFERENCES repos (node_id),
      FOREIGN KEY (author_id) REFERENCES authors (node_id)
    );`,
	).run();

	await env.DB.prepare(
		`CREATE TABLE IF NOT EXISTS repos (
      node_id TEXT PRIMARY KEY,
      name TEXT,
      url TEXT
    );`,
	).run();

	await env.DB.prepare(
		`CREATE TABLE IF NOT EXISTS authors (
      id INTEGER,
      node_id TEXT PRIMARY KEY,
      login TEXT,
      avatar_url TEXT,
      gravatar_id TEXT,
      url TEXT,
      html_url TEXT,
      followers_url TEXT,
      following_url TEXT,
      gists_url TEXT,
      starred_url TEXT,
      subscriptions_url TEXT,
      organizations_url TEXT,
      repos_url TEXT,
      events_url TEXT,
      received_events_url TEXT,
      type TEXT,
      site_admin INTEGER
    );`,
	).run();

	// Insert sample data
	await env.DB.prepare(`INSERT INTO repos (node_id, name, url) VALUES
    ('cloudflare/workers-sdk', 'workers-sdk', 'https://github.com/cloudflare/workers-sdk')`).run();

	return true;
}
