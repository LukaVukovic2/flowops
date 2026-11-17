/**
 * Auto-Apply Database Migrations via Direct Connection
 * 
 * This script applies all SQL migrations directly via PostgreSQL client
 * Run with: node apply-migrations-auto.js
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Client } = pg;

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

// Parse Supabase connection string
function getConnectionConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL not found in environment variables');
  }

  // Extract project ID from URL: https://<project-id>.supabase.co
  const projectId = supabaseUrl.replace('https://', '').split('.')[0];
  
  return {
    host: `db.${projectId}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  };
}

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
 * Create migrations tracking table if it doesn't exist
 */
async function ensureMigrationsTable(client) {
  console.log(`${colors.blue}📋 Checking migrations tracking table...${colors.reset}`);
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await client.query(createTableSQL);
    console.log(`${colors.green}✓ Migrations tracking table ready${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error creating migrations table:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(client) {
  try {
    const result = await client.query(
      'SELECT filename FROM _migrations ORDER BY applied_at ASC'
    );
    return result.rows.map(row => row.filename);
  } catch (error) {
    // Table might not exist yet
    return [];
  }
}

/**
 * Record a migration as applied
 */
async function recordMigration(client, filename) {
  try {
    await client.query(
      'INSERT INTO _migrations (filename) VALUES ($1)',
      [filename]
    );
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error recording migration:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Apply a single migration
 */
async function applyMigration(client, filename, sql) {
  console.log(`${colors.cyan}📦 Applying: ${filename}${colors.reset}`);
  
  try {
    // Execute the SQL
    await client.query(sql);
    
    // Record the migration
    await recordMigration(client, filename);
    
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
║   FlowOps Auto Migration Runner        ║
╚════════════════════════════════════════╝
${colors.reset}`);
  
  // Get all migration files
  const migrationFiles = getMigrationFiles();
  
  if (migrationFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  No migration files found in ${MIGRATIONS_DIR}${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}📁 Found ${migrationFiles.length} migration files${colors.reset}\n`);
  
  // Connect to database
  let client;
  try {
    const config = getConnectionConfig();
    console.log(`${colors.blue}🔌 Connecting to database...${colors.reset}`);
    client = new Client(config);
    await client.connect();
    console.log(`${colors.green}✓ Connected to database${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Database connection failed:${colors.reset}`, error.message);
    console.log(`${colors.yellow}\nMake sure SUPABASE_DB_PASSWORD is set in .env file${colors.reset}`);
    return;
  }
  
  try {
    // Ensure migrations tracking table exists
    await ensureMigrationsTable(client);
    
    // Get already applied migrations
    const appliedMigrations = await getAppliedMigrations(client);
    
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
    
    console.log(`${colors.yellow}📋 ${pendingMigrations.length} pending migrations to apply${colors.reset}\n`);
    
    // Apply each pending migration
    let successCount = 0;
    let failureCount = 0;
    
    for (const file of pendingMigrations) {
      const sql = readMigrationFile(file);
      if (!sql) {
        failureCount++;
        continue;
      }
      
      const success = await applyMigration(client, file, sql);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }
    
    // Summary
    console.log(`${colors.blue}
╔════════════════════════════════════════╗
║         MIGRATION SUMMARY              ║
╚════════════════════════════════════════╝
${colors.reset}`);
    console.log(`${colors.green}✓ Successfully applied: ${successCount}${colors.reset}`);
    if (failureCount > 0) {
      console.log(`${colors.red}✗ Failed: ${failureCount}${colors.reset}`);
    }
    console.log();
    
  } finally {
    // Close database connection
    await client.end();
    console.log(`${colors.blue}🔌 Database connection closed${colors.reset}`);
  }
}

// Run the migration script
main()
  .then(() => {
    console.log(`${colors.blue}
╔════════════════════════════════════════╗
║      Migration complete                ║
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
