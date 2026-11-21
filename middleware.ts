import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

export async function middleware(request: NextRequest) {
  // Middleware permisivo: no bloquea rutas mientras no haya backend configurado.
  // La autenticación se maneja del lado del cliente con AuthProvider local.
  return NextResponse.next();
}
