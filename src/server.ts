import "dotenv/config";          // MUST be the first line
import { app } from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 4000;

// Local development only. Vercel imports the app from app.ts and never
// runs this file, so nothing here is needed once it is deployed.

// Still connect right away, so a wrong MONGODB_URI shows up in this
// terminal within five seconds instead of on the first request. connectDB
// hands out one connection, so this is the one the middleware waits for.
connectDB().catch((err: unknown) => {
  // Logged, not exited: the failed request reports what happened, and the
  // process stays up to answer the next one.
  console.error("Could not connect to MongoDB:", err);
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
