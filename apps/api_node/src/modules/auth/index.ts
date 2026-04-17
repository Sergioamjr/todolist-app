import Elysia from "elysia";
import { auth } from "./auth-instance.js";
export { auth };

export const authGuard = new Elysia({ name: "auth-guard" })
  .derive({ as: "scoped" }, async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return { userId: session?.user.id ?? "user-id" };
  })
  .onBeforeHandle({ as: "scoped" }, ({ userId, set }) => {
    // if (!userId) {
    //   set.status = 401;
    //   return "Unauthorized";
    // }
  });
