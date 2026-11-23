import { NextResponse, type NextRequest } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Next.js 16 usa `proxy.ts` (antes `middleware.ts`).
 * Genera un nonce por petición para una CSP estricta sin `unsafe-inline`.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const connectSrc = isProduction
    ? "'self'"
    : "'self' http://localhost:8000 ws: wss:";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isProduction ? "" : " 'unsafe-eval'"
    }`,
    // En desarrollo el overlay de Next.js aplica estilos inline: con un nonce
    // presente, 'unsafe-inline' se ignora. El modo estricto queda para producción.
    isProduction ? `style-src 'self' 'nonce-${nonce}'` : "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)"],
};
