import "dotenv/config";
import { initDb } from "./db.js";
import { app } from "./app.js";

const port = Number(process.env.PORT) || 3001;

await initDb();
app.listen(port);
console.log(`API running at http://localhost:${port}`);

export default app;
