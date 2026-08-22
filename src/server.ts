import "@backend/lib/error-capture";

import { consumeLastCapturedError } from "@backend/lib/error-capture";
import { renderErrorPage } from "@backend/lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

const ALLOWED_ORIGINS = [
  "https://19th-jh-ncc-crm-v1-0.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
];

function getCorsOrigin(origin: string | null): string {
  if (
    origin &&
    (ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".netlify.app"))
  ) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
}

function applyCorsHeaders(response: Response, origin: string | null): Response {
  const newHeaders = new Headers(response.headers);
  const allowOrigin = getCorsOrigin(origin);
  newHeaders.set("Access-Control-Allow-Origin", allowOrigin);
  newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
  newHeaders.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Request-ID, X-Client-Version",
  );
  newHeaders.set("Access-Control-Allow-Credentials", "true");
  newHeaders.set("X-Content-Type-Options", "nosniff");
  newHeaders.set("X-Frame-Options", "SAMEORIGIN");
  newHeaders.set("Vary", "Accept-Encoding, Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const origin = request.headers.get("origin");

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      const allowOrigin = getCorsOrigin(origin);
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowOrigin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Request-ID, X-Client-Version",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    try {
      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(rawResponse);
      return applyCorsHeaders(normalized, origin);
    } catch (error) {
      console.error(error);
      const errorResp = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      return applyCorsHeaders(errorResp, origin);
    }
  },
};
