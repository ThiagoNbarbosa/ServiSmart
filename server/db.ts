import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use Supabase database URL if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.hoocaygyntpguglbibod:Tms051217@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });