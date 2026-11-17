import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_SUPABASE_URL = "https://kvruyhkyknldhhsvhflt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cnV5aGt5a25sZGhoc3ZoZmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5MDUyMzksImV4cCI6MjExMDQ4MTIzOX0.7sqUlcn05G1nzBhJ38kH8qn-bMNdXEmkd--YDqs864k";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protected paths
  const isProtectedPath =
    path.startsWith("/athlete") ||
    path.startsWith("/coach") ||
    path.startsWith("/medical") ||
    path.startsWith("/admin");

  const isAuthPath =
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password";

  // If unauthenticated trying to access protected page
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // If user is authenticated, query their profile role to protect role-specific routes
  if (user && (isProtectedPath || isAuthPath)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "athlete";

    // Deactivated account check
    if (profile && profile.is_active === false && isProtectedPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_deactivated");
      return NextResponse.redirect(url);
    }

    // If on auth path (/login or /register) and already logged in, redirect to their role dashboard
    if (isAuthPath) {
      const targetDashboard =
        role === "coach"
          ? "/coach/dashboard"
          : role === "medical"
          ? "/medical/dashboard"
          : role === "admin"
          ? "/admin/dashboard"
          : "/athlete/dashboard";

      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // Role-based protection:
    // Coaches cannot access /athlete, /medical, /admin
    if (path.startsWith("/athlete") && role !== "athlete" && role !== "admin") {
      const redirectUrl =
        role === "coach" ? "/coach/dashboard" : "/medical/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (path.startsWith("/coach") && role !== "coach" && role !== "admin") {
      const redirectUrl =
        role === "athlete" ? "/athlete/dashboard" : "/medical/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (path.startsWith("/medical") && role !== "medical" && role !== "admin") {
      const redirectUrl =
        role === "athlete" ? "/athlete/dashboard" : "/coach/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (path.startsWith("/admin") && role !== "admin") {
      const redirectUrl =
        role === "athlete"
          ? "/athlete/dashboard"
          : role === "coach"
          ? "/coach/dashboard"
          : "/medical/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
