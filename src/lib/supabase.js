import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://smmwylqonxepfohbxyga.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbXd5bHFvbnhlcGZvaGJ4eWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAzMDQ3MywiZXhwIjoyMDgwNjA2NDczfQ.ZS0c_mkw6-sutHRZVH4Mw5bV6yjddJqMLfGRoFJdmrc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
