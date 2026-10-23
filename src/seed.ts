import "dotenv/config";          // MUST be the first line
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Course } from "./models/Course";
import { COURSES } from "./data/courses";

// npm run seed. Safe to run more than once. Nothing else writes a course.
async function seed() {
  await connectDB();

  for (const course of COURSES) {
    // upsert: update the row with this code, or insert it if there is
    // none. Running this twice leaves three courses, not six.
    await Course.updateOne({ code: course.code }, course, { upsert: true });
  }

  console.log(`${COURSES.length} courses in ${mongoose.connection.name}`);

  // The connection is an open socket, and Node keeps running while one
  // is open. Without this the script never ends.
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
