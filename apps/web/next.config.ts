import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Most routes on this site are statically prerendered at build time, which
// rules out a per-request nonce for script-src (the nonce in a dynamic CSP
// header would never match the nonce baked into a static HTML file, and
// Next's own inline RSC-hydration script tags would get blocked, breaking
// hydration entirely). 'unsafe-inline' for scripts is the honest tradeoff
// here — same one already made for style-src, where inline style={{}}
// attributes are pervasive. The security-critical surface (auth, admin
// CRUD, canvas) lives behind apps/api, which has its own strict CSP,
// CORS allowlist, CSRF checks, and rate limiting.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cloud.umami.is",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  `connect-src 'self' ${apiUrl} https://cloud.umami.is`,
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@daredev/shared"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
