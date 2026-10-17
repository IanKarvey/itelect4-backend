import { Schema, model } from "mongoose";
import type { CourseDoc } from "../types/index";

const courseSchema = new Schema<CourseDoc>({
  // unique is what lets GET /api/courses/:code use findOne and know
  // nothing else could have matched.
  code: {
    type: String,
    required: [true, "code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },

  title: { type: String, required: [true, "title is required"], trim: true },

  // The interface only says "a number". The schema says 1 to 6.
  units: { type: Number, required: true, min: 1, max: 6 },

  semester: { type: String, required: true, trim: true },
});

// Course never had an id (the code identifies it), so there is nothing
// to rename. Only the two fields Mongo adds have to come out.
courseSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Course = model<CourseDoc>("Course", courseSchema);
