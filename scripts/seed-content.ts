import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { neon } from "@neondatabase/serverless";

const root = process.cwd();

function loadLocalEnv() {
  const file = path.join(root, "apps/api/.env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

loadLocalEnv();
const sql = neon(required("DATABASE_URL"));

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function parseProjectsYaml() {
  const projects: Array<{ title: string; desc: string; links: string[]; techstack: string[] }> = [];
  let current: (typeof projects)[number] | null = null;
  let list: "links" | "techstack" | null = null;
  for (const raw of fs.readFileSync(path.join(root, "apps/web/public/projects.yaml"), "utf8").split("\n")) {
    const line = raw.trim();
    if (line.startsWith("- title:")) {
      if (current) projects.push(current);
      current = { title: line.slice(8).trim().replace(/^['"]|['"]$/g, ""), desc: "", links: [], techstack: [] };
      list = null;
    } else if (current && line.startsWith("desc:")) {
      current.desc = line.slice(5).trim().replace(/^['"]|['"]$/g, "");
    } else if (current && line === "links:") list = "links";
    else if (current && line === "techstack:") list = "techstack";
    else if (current && line.startsWith("- ") && list) current[list].push(line.slice(2).trim().replace(/^['"]|['"]$/g, ""));
  }
  if (current) projects.push(current);
  return projects;
}

async function seedNeon() {
  let projectOrder = 0;
  for (const project of parseProjectsYaml()) {
    const existing = await sql`select id from projects where title = ${project.title} limit 1`;
    if (existing.length) {
      await sql`update projects set description=${project.desc}, tech_stack=${project.techstack}, links=${JSON.stringify(project.links)}, order_index=${projectOrder} where id=${existing[0].id}`;
    } else {
      await sql`insert into projects (title, description, tech_stack, links, order_index) values (${project.title}, ${project.desc}, ${project.techstack}, ${JSON.stringify(project.links)}, ${projectOrder})`;
    }
    projectOrder++;
  }

  const resources = JSON.parse(fs.readFileSync(path.join(root, "apps/web/public/resources.json"), "utf8"));
  for (const [category, entries] of Object.entries(resources) as [string, any[]][]) {
    for (let orderIndex = 0; orderIndex < entries.length; orderIndex++) {
      const item = entries[orderIndex];
      const existing = await sql`select id from resources where category=${category} and title=${item.title} limit 1`;
      if (existing.length) {
        await sql`update resources set description=${item.description ?? null}, url=${item.url}, status=${item.status}, order_index=${orderIndex} where id=${existing[0].id}`;
      } else {
        await sql`insert into resources (category, title, description, url, status, order_index) values (${category}, ${item.title}, ${item.description ?? null}, ${item.url}, ${item.status}, ${orderIndex})`;
      }
    }
  }

  const blogs = JSON.parse(fs.readFileSync(path.join(root, "apps/web/public/blogs.json"), "utf8"));
  for (let orderIndex = 0; orderIndex < blogs.length; orderIndex++) {
    const blog = blogs[orderIndex];
    const existing = await sql`select id from blog_posts where slug=${blog.slug} limit 1`;
    let id: string;
    if (existing.length) {
      id = existing[0].id;
      await sql`update blog_posts set title=${blog.title}, description=${blog.description}, date=${blog.date}, author=${blog.author}, tags=${blog.tags}, read_time=${blog.readTime}, featured=${blog.featured}, published=true, order_index=${orderIndex} where id=${id}`;
    } else {
      const rows = await sql`insert into blog_posts (slug, title, description, date, author, tags, read_time, featured, published, order_index) values (${blog.slug}, ${blog.title}, ${blog.description}, ${blog.date}, ${blog.author}, ${blog.tags}, ${blog.readTime}, ${blog.featured}, true, ${orderIndex}) returning id`;
      id = rows[0].id as string;
    }
    void id;
  }
}

async function seedFirestore() {
  const b64 = required("FIREBASE_SERVICE_ACCOUNT");
  const serviceAccount = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);
  const blogs = JSON.parse(fs.readFileSync(path.join(root, "apps/web/public/blogs.json"), "utf8"));
  for (const blog of blogs) {
    const body = fs.readFileSync(path.join(root, "apps/web/public/blogs", blog.contentFile), "utf8");
    await db.doc(`blogPosts/${blog.slug}`).set({ body, format: "markdown", updatedAt: new Date().toISOString() }, { merge: true });
  }
}

async function main() {
  await seedNeon();
  await seedFirestore();
  console.log("Seeded projects, resources, blog metadata, and blog bodies.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
