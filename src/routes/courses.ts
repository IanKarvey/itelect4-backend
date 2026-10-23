import { Router, type Request, type Response } from "express";
import { Course } from "../models/Course";

export const courseRouter = Router();

// No requireAuth in this file on purpose. The course list is what the
// app shows before anybody has logged in, so both routes are public.

// GET /api/courses -- alphabetical, which is what a dropdown wants
courseRouter.get("/", async (_req: Request, res: Response) => {
  const courses = await Course.find().sort({ code: 1 });
  res.json(courses);
});

interface CodeParam {
  code: string;
}

// GET /api/courses/ITELECT4
courseRouter.get(
  "/:code",
  async (req: Request<CodeParam>, res: Response) => {
    // The schema uppercases code when it is saved, so the URL has to be
    // raised too or /courses/itelect4 would match nothing.
    const course = await Course.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!course) {
      res.status(404).json({
        message: `No course with code "${req.params.code}"`,
      });
      return;
    }

    res.json(course);
  },
);
