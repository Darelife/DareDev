import type {
  BlogPostFull,
  BlogPostMeta,
  CanvasScene,
  Project,
  ResourcesByCategory,
} from "@daredev/shared";
import { readCsrfCookie } from "./csrf-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type AuthUser = {
  id: string;
  username: string;
};

export type AuthCheckResult = {
  authenticated: boolean;
  user?: AuthUser;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = readCsrfCookie();
    if (csrfToken) {
      headers.set("x-csrf-token", csrfToken);
    }
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }

  return data;
}

/* ─── Auth ──────────────────────────────────────────────────────────── */

export async function checkAuth(): Promise<AuthCheckResult> {
  try {
    return await apiFetch("/api/auth/check");
  } catch {
    return { authenticated: false };
  }
}

export async function login(username: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/* ─── Canvas (single private document) ─────────────────────────────── */

export async function loadCanvas(): Promise<CanvasScene> {
  const data = await apiFetch("/api/canvas");
  return data.canvas;
}

export async function saveCanvas(elements: any[], appState: any, files: any) {
  return apiFetch("/api/canvas", {
    method: "POST",
    body: JSON.stringify({ elements, appState, files }),
  });
}

/* ─── Admin: users ──────────────────────────────────────────────────── */

export async function listUsers() {
  const data = await apiFetch("/api/admin/users");
  return data.users as { id: string; username: string; created_at: string }[];
}

export async function createUser(username: string, password: string) {
  const data = await apiFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return data.user;
}

/* ─── Admin: projects ───────────────────────────────────────────────── */

export type AdminProject = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  links: { url: string; text?: string }[];
  orderIndex: number;
};

export async function adminListProjects(): Promise<AdminProject[]> {
  const data = await apiFetch("/api/admin/projects");
  return data.projects;
}

export async function adminCreateProject(input: Omit<AdminProject, "id">) {
  const data = await apiFetch("/api/admin/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.project as AdminProject;
}

export async function adminUpdateProject(id: string, input: Partial<Omit<AdminProject, "id">>) {
  const data = await apiFetch(`/api/admin/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.project as AdminProject;
}

export async function adminDeleteProject(id: string) {
  return apiFetch(`/api/admin/projects/${id}`, { method: "DELETE" });
}

/* ─── Admin: resources ──────────────────────────────────────────────── */

export type AdminResource = {
  id: string;
  category: string;
  title: string;
  description?: string;
  url: string;
  status: 0 | 1 | 2;
  orderIndex: number;
};

export async function adminListResources(): Promise<AdminResource[]> {
  const data = await apiFetch("/api/admin/resources");
  return data.resources;
}

export async function adminCreateResource(input: Omit<AdminResource, "id">) {
  const data = await apiFetch("/api/admin/resources", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.resource as AdminResource;
}

export async function adminUpdateResource(id: string, input: Partial<Omit<AdminResource, "id">>) {
  const data = await apiFetch(`/api/admin/resources/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.resource as AdminResource;
}

export async function adminDeleteResource(id: string) {
  return apiFetch(`/api/admin/resources/${id}`, { method: "DELETE" });
}

/* ─── Admin: blog ───────────────────────────────────────────────────── */

export type AdminBlogPost = BlogPostMeta & { body: string };

export async function adminListBlogPosts(): Promise<BlogPostMeta[]> {
  const data = await apiFetch("/api/admin/blog");
  return data.posts;
}

export async function adminGetBlogPost(id: string): Promise<AdminBlogPost> {
  const data = await apiFetch(`/api/admin/blog/${id}`);
  return data.post;
}

export async function adminCreateBlogPost(input: {
  slug: string;
  title: string;
  description: string;
  date?: string;
  author?: string;
  tags: string[];
  readTime?: number;
  featured: boolean;
  published: boolean;
  body: string;
}) {
  const data = await apiFetch("/api/admin/blog", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.post;
}

export async function adminUpdateBlogPost(
  id: string,
  input: Partial<{
    slug: string;
    title: string;
    description: string;
    date: string;
    author: string;
    tags: string[];
    readTime: number;
    featured: boolean;
    published: boolean;
    body: string;
  }>
) {
  const data = await apiFetch(`/api/admin/blog/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.post;
}

export async function adminDeleteBlogPost(id: string) {
  return apiFetch(`/api/admin/blog/${id}`, { method: "DELETE" });
}

/* ─── Public: content read by the marketing site ───────────────────── */

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/api/public/projects`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects ?? [];
}

export async function getResources(): Promise<ResourcesByCategory> {
  const res = await fetch(`${API_URL}/api/public/resources`, { cache: "no-store" });
  if (!res.ok) return {};
  const data = await res.json();
  return data.resources ?? {};
}

export async function getBlogList(): Promise<BlogPostMeta[]> {
  const res = await fetch(`${API_URL}/api/public/blog`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.posts ?? [];
}

export async function getBlogPost(slug: string): Promise<BlogPostFull | null> {
  const res = await fetch(`${API_URL}/api/public/blog/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.post ?? null;
}
