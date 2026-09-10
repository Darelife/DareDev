import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const CreateUserSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(200),
});

const LinkSchema = z.union([
  z.string().url(),
  z.object({ url: z.string().url(), text: z.string().optional() }),
]);

export const ProjectInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).default(""),
  techStack: z.array(z.string().trim().min(1)).default([]),
  links: z.array(LinkSchema).default([]),
  orderIndex: z.number().int().default(0),
});
export const ProjectUpdateSchema = ProjectInputSchema.partial();

export const ResourceInputSchema = z.object({
  category: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
  url: z.string().url(),
  status: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  orderIndex: z.number().int().default(0),
});
export const ResourceUpdateSchema = ResourceInputSchema.partial();

export const BlogPostInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers, and hyphens only"),
  title: z.string().trim().min(1).max(300),
  description: z.string().max(1000).default(""),
  date: z.string().optional(),
  author: z.string().max(100).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  readTime: z.number().int().positive().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  body: z.string().max(500_000),
});
export const BlogPostUpdateSchema = BlogPostInputSchema.partial();

export const CanvasSceneSchema = z.object({
  elements: z.array(z.unknown()).default([]),
  appState: z.record(z.string(), z.unknown()).default({}),
  files: z.record(z.string(), z.unknown()).default({}),
});

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must use YYYY-MM-DD");
const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "time must use HH:mm");

export const TaskInputSchema = z.object({
  content: z.string().trim().min(1).max(500),
  type: z.union([z.literal("planned"), z.literal("actual")]),
  taskDate: DateSchema,
  taskTime: TimeSchema,
});
export const TaskUpdateSchema = TaskInputSchema.partial();

export const DeadlineInputSchema = z.object({
  content: z.string().trim().min(1).max(500),
  targetDate: DateSchema,
  targetTime: TimeSchema,
});
export const DeadlineUpdateSchema = DeadlineInputSchema.partial();
