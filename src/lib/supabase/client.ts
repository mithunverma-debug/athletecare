import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://kvruyhkyknldhhsvhflt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cnV5aGt5a25sZGhoc3ZoZmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5MDUyMzksImV4cCI6MjExMDQ4MTIzOX0.7sqUlcn05G1nzBhJ38kH8qn-bMNdXEmkd--YDqs864k";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
