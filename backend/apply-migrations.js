/**
 * Apply Database Migrations
 * 
 * This script applies all SQL migrations from the supabase/migrations directory
 * Run with: node apply-migrations.js
 */

import { supabase } from './src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
 * Check if a migrations tracking table exists
 */
async function ensureMigrationsTable() {
  console.log(`${colors.blue}📋 Checking migrations tracking table...${colors.reset}`);
  
  const { error } = await supabase.rpc('create_migrations_table', {});
  
  if (error && !error.message.includes('already exists')) {
    // If RPC doesn't exist, create table directly
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      // Try direct query as fallback
      const { error: directError } = await supabase
        .from('_migrations')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, we need to create it via SQL
      if (directError?.message?.includes('does not exist')) {
        console.log(`${colors.yellow}⚠️  Migrations table doesn't exist. You need to create it manually.${colors.reset}`);
        console.log(`${colors.cyan}Run this SQL in Supabase SQL Editor:${colors.reset}`);
        console.log(createTableSQL);
        return false;
      }
    }
  }
  
  console.log(`${colors.green}✓ Migrations tracking table ready${colors.reset}`);
  return true;
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations() {
  // Try to query the migrations table
  const { data, error } = await supabase
    .from('_migrations')
    .select('filename')
    .order('applied_at', { ascending: true });
  
  if (error) {
    // Table might not exist yet, return empty array
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
 * Apply a single migration
 */
async function applyMigration(filename, sql) {
  console.log(`${colors.cyan}📦 Applying: ${filename}${colors.reset}`);
  
  try {
    // Execute the SQL using Supabase client
    // Note: Supabase JS client doesn't directly support raw SQL execution
    // We need to use the SQL editor or REST API for this
    
    // For now, we'll use a workaround by making a direct request
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      // If RPC doesn't exist, we need to apply migrations manually
      console.log(`${colors.yellow}⚠️  Cannot execute SQL directly via API${colors.reset}`);
      console.log(`${colors.yellow}⚠️  Please apply migrations manually through Supabase SQL Editor${colors.reset}`);
      return false;
    }
    
    // Record the migration
    await recordMigration(filename);
    
    console.log(`${colors.green}✓ Successfully applied: ${filename}${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error applying migration ${filename}:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Main function to apply all pending migrations
 */
async function main() {
  console.log(`${colors.blue}
╔════════════════════════════════════════╗
║   FlowOps Database Migration Runner    ║
╚════════════════════════════════════════╝
${colors.reset}`);
  
  // Get all migration files
  const migrationFiles = getMigrationFiles();
  
  if (migrationFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  No migration files found in ${MIGRATIONS_DIR}${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}📁 Found ${migrationFiles.length} migration files${colors.reset}\n`);
  
  // List all migrations
  console.log(`${colors.cyan}Migration files:${colors.reset}`);
  migrationFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log();
  
  // Ensure migrations tracking table exists
  const tableReady = await ensureMigrationsTable();
  
  // Get already applied migrations
  const appliedMigrations = await getAppliedMigrations();
  
  if (appliedMigrations.length > 0) {
    console.log(`${colors.green}✓ ${appliedMigrations.length} migrations already applied${colors.reset}\n`);
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
  
  console.log(`${colors.yellow}📋 ${pendingMigrations.length} pending migrations to apply${colors.reset}\n`);
  
  // Show manual application instructions
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║                MANUAL MIGRATION REQUIRED                     ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`Due to Supabase client limitations, migrations must be applied manually.`);
  console.log(`\n${colors.yellow}Please follow these steps:${colors.reset}\n`);
  console.log(`1. Go to your Supabase Dashboard: ${process.env.SUPABASE_URL}`);
  console.log(`2. Navigate to: SQL Editor`);
  console.log(`3. Apply the following migrations in order:\n`);
  
  pendingMigrations.forEach((file, index) => {
    const filepath = path.join(MIGRATIONS_DIR, file);
    console.log(`${colors.cyan}${index + 1}. ${file}${colors.reset}`);
    console.log(`   File path: ${filepath}\n`);
  });
  
  console.log(`${colors.green}After applying all migrations, run this script again to verify.${colors.reset}\n`);
  
  // Alternative: Show SQL content for copy-paste
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║              SQL CONTENT FOR COPY-PASTE                      ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  for (const file of pendingMigrations) {
    console.log(`\n${colors.yellow}━━━ ${file} ━━━${colors.reset}\n`);
    const sql = readMigrationFile(file);
    if (sql) {
      console.log(sql);
      console.log(`\n${colors.yellow}━━━ End of ${file} ━━━${colors.reset}\n`);
    }
  }
}

// Run the migration script
main()
  .then(() => {
    console.log(`${colors.blue}
╔════════════════════════════════════════╗
║      Migration check complete          ║
╚════════════════════════════════════════╝
${colors.reset}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}
╔════════════════════════════════════════╗
║           Migration failed             ║
╚════════════════════════════════════════╝
${colors.reset}`);
    console.error(error);
    process.exit(1);
  });
