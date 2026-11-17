/**
 * Apply Database Migrations via Supabase Management API
 * 
 * This script applies all SQL migrations using Supabase client
 * Run with: node apply-migrations-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: {
      transport: ws
    }
  }
);

/**
 * Read all migration files from the migrations directory
 */
function getMigrationFiles() {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order
    return sqlFiles;
  } catch (error) {
    console.error(`${colors.red}❌ Error reading migrations directory:${colors.reset}`, error.message);
    return [];
  }
}

/**
 * Read the content of a migration file
 */
function readMigrationFile(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  try {
    return fs.readFileSync(filepath, 'utf8');
  } catch (error) {
    console.error(`${colors.red}❌ Error reading file ${filename}:${colors.reset}`, error.message);
    return null;
  }
}

/**
 * Execute raw SQL using Supabase
 */
async function executeSQL(sql) {
  try {
    // Use Supabase RPC to execute raw SQL
    // Note: This requires creating a custom function in Supabase first
    const { data, error } = await supabase.rpc('exec_raw_sql', { sql_query: sql });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if migrations table exists and create if needed
 */
async function ensureMigrationsTable() {
  console.log(`${colors.blue}📋 Checking migrations tracking table...${colors.reset}`);
  
  // Try to query the table first
  const { data, error } = await supabase
    .from('_migrations')
    .select('id')
    .limit(1);
  
  if (error && error.message.includes('does not exist')) {
    console.log(`${colors.yellow}⚠️  Migrations table doesn't exist. Creating...${colors.reset}`);
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    const result = await executeSQL(createTableSQL);
    
    if (!result.success) {
      console.log(`${colors.red}❌ Cannot create migrations table via API${colors.reset}`);
      console.log(`${colors.yellow}Please create it manually in Supabase SQL Editor:${colors.reset}`);
      console.log(createTableSQL);
      return false;
    }
  }
  
  console.log(`${colors.green}✓ Migrations tracking table ready${colors.reset}`);
  return true;
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations() {
  const { data, error } = await supabase
    .from('_migrations')
    .select('filename')
    .order('applied_at', { ascending: true });
  
  if (error) {
    console.log(`${colors.yellow}⚠️  Could not read applied migrations:${colors.reset}`, error.message);
    return [];
  }
  
  return data.map(row => row.filename);
}

/**
 * Record a migration as applied
 */
async function recordMigration(filename) {
  const { error } = await supabase
    .from('_migrations')
    .insert({ filename });
  
  if (error) {
    console.error(`${colors.red}❌ Error recording migration:${colors.reset}`, error.message);
    return false;
  }
  
  return true;
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.blue}
╔════════════════════════════════════════╗
║   FlowOps Migration Manager            ║
╚════════════════════════════════════════╝
${colors.reset}`);
  
  // Get all migration files
  const migrationFiles = getMigrationFiles();
  
  if (migrationFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  No migration files found${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}📁 Found ${migrationFiles.length} migration files${colors.reset}\n`);
  
  // List all migrations
  console.log(`${colors.cyan}Available migrations:${colors.reset}`);
  migrationFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log();
  
  // Ensure migrations table exists
  const tableReady = await ensureMigrationsTable();
  if (!tableReady) {
    console.log(`${colors.yellow}\nPlease create the _migrations table manually and run this script again.${colors.reset}`);
    return;
  }
  
  // Get already applied migrations
  const appliedMigrations = await getAppliedMigrations();
  
  if (appliedMigrations.length > 0) {
    console.log(`${colors.green}✓ ${appliedMigrations.length} migrations already applied${colors.reset}`);
    appliedMigrations.forEach(file => {
      console.log(`  - ${file}`);
    });
    console.log();
  }
  
  // Filter pending migrations
  const pendingMigrations = migrationFiles.filter(
    file => !appliedMigrations.includes(file)
  );
  
  if (pendingMigrations.length === 0) {
    console.log(`${colors.green}
╔════════════════════════════════════════╗
║   All migrations are up to date! ✓     ║
╚════════════════════════════════════════╝
${colors.reset}`);
    return;
  }
  
  console.log(`${colors.yellow}📋 ${pendingMigrations.length} pending migrations${colors.reset}\n`);
  
  // Show instructions for manual application
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║              APPLY MIGRATIONS MANUALLY                       ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`\n${colors.yellow}To apply migrations:${colors.reset}\n`);
  console.log(`1. Go to: ${process.env.SUPABASE_URL}/project/_/sql`);
  console.log(`2. Copy and run each SQL migration below in order\n`);
  
  for (const file of pendingMigrations) {
    const filepath = path.join(MIGRATIONS_DIR, file);
    console.log(`${colors.cyan}━━━ ${file} ━━━${colors.reset}`);
    console.log(`File: ${filepath}\n`);
    
    const sql = readMigrationFile(file);
    if (sql) {
      console.log(sql);
      console.log(`\n${colors.yellow}After running, mark as applied with:${colors.reset}`);
      console.log(`INSERT INTO _migrations (filename) VALUES ('${file}');\n`);
    }
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  }
  
  console.log(`${colors.green}\nAfter applying all migrations, run this script again to verify.${colors.reset}\n`);
}

// Run the script
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  });
