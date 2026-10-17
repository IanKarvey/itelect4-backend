import type { Types } from "mongoose";

// FROM SESSION 1: the three interfaces, copied from itelect4-project's
// src/types/index.ts. The schemas in src/models/ are these interfaces
// written a second time in a form the database can enforce.

export interface User {
  id:       number;
  name:     string;
  email:    string;
  role:     "student" | "admin" | "instructor";
  isActive: boolean;
}

export interface Course {
  code:     string;
  title:    string;
  units:    number;
  semester: string;
}

export interface Submission {
  id:          number;
  studentId:   number;
  courseCode:  string;
  repoUrl:     string;
  submittedAt: Date;
  score?:      number;
}

// ---------------------------------------------------------------------
// What the database actually stores.
//
// Session 1 wrote `id: number` because a mock array numbered its own rows.
// MongoDB assigns a 24-character hex id, so stored types are DERIVED with
// Omit (Session 2 utility type). The interface stays the single source of
// truth: add a field there and these inherit it.
// ---------------------------------------------------------------------

export type UserDoc = Omit<User, "id"> & {
  password: string;
};

// studentId is an ObjectId, NOT a string. Typing it as string makes the
// schema report errors on every field at once.
export type SubmissionDoc = Omit<Submission, "id" | "studentId"> & {
  studentId: Types.ObjectId;
};

// Course has no id (the code is its identity), so nothing is renamed or
// left out. Pick still has to name all four fields: it builds a mapped
// type, and the toJSON transform in Course.ts takes a Record, which an
// interface is not assignable to.
export type CourseDoc = Pick<Course, "code" | "title" | "units" | "semester">;

// The body a client sends to create one. No id (MongoDB makes it) and no
// studentId (the server reads it from the token).
export type NewSubmissionBody = Pick<Submission, "courseCode" | "repoUrl">;
