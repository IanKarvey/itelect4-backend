import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { authRouter } from "./routes/auth";
import { courseRouter } from "./routes/courses";
import { submissionRouter } from "./routes/submissions";
import { aiRouter } from "./routes/ai";

// Builds the app and stops. Never opens a port.
export const app = express();

// Only the origins listed in CORS_ORIGIN may read replies from this API.
// Comma-separated, so the list differs between laptop and Vercel without
// the code knowing which it is. Read once at import: changing it on
// Vercel needs a redeploy. Unset means an empty list, so nothing passes.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin !== "");

app.use(cors({ origin: ALLOWED_ORIGINS }));

// Creates req.body from JSON bodies (only when Content-Type: application/json).
app.use(express.json());

// Deployed there is no startup step -- the app IS the function and a
// request is the first thing that happens. So waiting for the database
// moves here, in front of every route. After the first request this
// awaits a promise that has already resolved.
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/courses", courseRouter);
app.use("/api/submissions", submissionRouter);
// Private, rate limited, and the only route that talks to Gemini.
app.use("/api/ai", aiRouter);

// 404 for unknown paths, as JSON. MUST be after all routers.
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// Error handler. FOUR parameters is what tells Express this is the error
// handler, so _next must stay even though it is never called.
// Express 5 forwards rejected promises from async routes here automatically.
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    // Thrown when a URL id is not a valid ObjectId.
    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  },
);

// Vercel looks for the Express app in app.ts and wants it as the default
// export. That is the whole deployment config, so there is no vercel.json.
export default app;
