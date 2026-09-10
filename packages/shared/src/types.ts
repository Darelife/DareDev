export type User = {
  id: string;
  username: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  username: string;
};

export type ProjectLink = {
  url: string;
  text?: string;
};

export type Project = {
  id: string;
  title: string;
  desc: string;
  techstack: string[];
  links: ProjectLink[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ResourceStatus = 0 | 1 | 2;

export type Resource = {
  id: string;
  category: string;
  title: string;
  description?: string;
  url: string;
  status: ResourceStatus;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ResourcesByCategory = Record<string, Resource[]>;

export type BlogPostMeta = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: number;
  featured: boolean;
  published: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostFull = BlogPostMeta & {
  body: string;
  format: "markdown";
};

export type CanvasScene = {
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
  updatedAt: string;
  updatedBy: string | null;
};

export type Task = {
  id: string;
  content: string;
  type: "planned" | "actual";
  taskDate: string;
  taskTime: string;
  createdAt: string;
};

export type Deadline = {
  id: string;
  content: string;
  targetDate: string;
  targetTime: string;
  createdAt: string;
};
