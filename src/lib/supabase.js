import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://odcivnnmxopbjnwueewb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kY2l2bm5teG9wYmpud3VlZXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTU1MTMsImV4cCI6MjA5MDA5MTUxM30.C3zCA-VpiqAMV01JwzJ2yV7n62IdiE-L1DCgcl4rkEg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const ADMIN_EMAIL = "guilherme@comparai.com";
