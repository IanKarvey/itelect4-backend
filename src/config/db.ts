import mongoose from "mongoose";

// The promise is kept, not the connection. The first caller starts the
// connect; every caller after it gets this same promise back, so many
// requests on one instance share one connection.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  // Fail early with a sentence that names the file to fix.
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  if (connection === null) {
    // Default wait is 30s (measured 31s of a frozen-looking terminal).
    // 5000ms makes a bad/unreachable URI fail in about 6 seconds, which
    // also keeps it under a deployed function's own time limit.
    connection = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log("MongoDB connected:", m.connection.name);
        return m;
      })
      .catch((err: unknown) => {
        // Forget a failed attempt. A rejected promise stays rejected, so
        // keeping it would fail every later request with the same error.
        connection = null;
        throw err;
      });
  }

  return connection;
}
