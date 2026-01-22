import { createBrowserClient } from '@supabase/ssr';

// Use createBrowserClient to enable cookie-based auth sharing with Middleware/Server Components
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
