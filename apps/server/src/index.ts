import { Hono } from "hono";
import type { Env } from "./types";
import { seedDb } from "./db/seed";
import { releasesApi } from "./releases/api";
import { updateReleases } from "./releases/scheduled";

const app = new Hono<{ Bindings: Env }>();

app.route("/", releasesApi);

app.post("/seed", async (c) => {
	await seedDb(c.env);

	return c.json({ message: "ok" }, 200);
});

export default {
	fetch: app.fetch,
	scheduled: async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
		ctx.waitUntil(updateReleases(env, "cloudflare/workers-sdk"));
	},
};
