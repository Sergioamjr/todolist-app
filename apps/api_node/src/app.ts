import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { auth } from "./modules/auth/index.js";
import { itemsModule } from "./modules/items/index.js";
import { initDb } from "./db.js";

export const app = new Elysia({ adapter: node() })
  .use(swagger())
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get("origin");
        const expected = process.env.UI_URL?.replace(/\/$/, "");
        if (origin === expected || expected === "*") return true;
        if (origin?.startsWith("http://localhost:")) return true;
        return false;
      },
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler)
  .use(itemsModule)
  .get("/", () => ({ message: "Hello World 2.0" }));

let ready = false;
const ensureReady = async () => {
  if (!ready) {
    await initDb();
    ready = true;
  }
};

export default async function handler(req: any, res: any) {
  await ensureReady();
  return (app as any).handle(req, res);
}
