import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null = null;

/**
 * Tagged-template SQL client. Every call is automatically parameterized by
 * @neondatabase/serverless — never build queries via string concatenation.
 */
export function getSql(): NeonQueryFunction<false, false> {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }
    cached = neon(url);
  }
  return cached;
}
