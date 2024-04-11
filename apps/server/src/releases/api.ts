import { Hono } from "hono";
import type { Env } from "../types";
import * as releases from "../db/releases";
import * as authors from "../db/authors";

export const releasesApi = new Hono<{ Bindings: Env }>();

releasesApi.get(":owner/:repo/releases/latest", async (c) => {
	const repo_id = `${c.req.param("owner")}/${c.req.param("repo")}`;

	const result = await releases.getLast(c.env, repo_id);

	if (!result) {
		return c.json(null, 500);
	}

	const author = await authors.getById(c.env, result.author_id);

	const data = {
		...result,
		author,
	};

	return c.json({ data });
});

releasesApi.get(":owner/:repo/releases/count", async (c) => {
	const repo_id = `${c.req.param("owner")}/${c.req.param("repo")}`;

	const { interval = "1d", intervalMs } = c.req.query();

	const ms = Number.parseInt(intervalMs, 10);

	const millisecondsMap = {
		"1h": 3_600_000,
		"1d": 86_400_000,
		"1w": 604_800_000,
		"1m": 2_592_000_000,
		"1y": 31_536_000_000,
	} as Record<string, number>;

	const results = await releases.count(c.env, {
		repo_id,
		interval: Number.isNaN(ms) ? millisecondsMap[interval] : ms,
	});

	if (!results.success) {
		return c.json({ message: results.error }, 500);
	}

	return c.json({ data: results.results });
});
