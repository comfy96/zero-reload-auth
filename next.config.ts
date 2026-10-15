import type { NextConfig } from "next";

/**
 * Static security headers. The CSP is per-request (it has a nonce),
 * so it is set in src/proxy.ts instead.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Hide the floating Next.js dev tools indicator (the "N" badge with the
  // Route/Bundler menu) so demos show only the app. Dev-only; compile and
  // runtime errors are still surfaced. Set to `{ position: "bottom-right" }`
  // or remove the line to bring it back.
  devIndicators: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Protected and auth pages must never be served from the browser's cache (back-button leaks).
      {
        source: "/(dashboard|login|signup)(.*)",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
