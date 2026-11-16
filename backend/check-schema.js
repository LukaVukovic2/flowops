/**
 * Check Database Schema
 * 
 * This script checks if all required tables exist in the database
 * Run with: node check-schema.js
 */

import { supabase } from './src/config/database.js';

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
 * List of tables that should exist according to Task 2
 */
const REQUIRED_TABLES = [
  { name: 'users', task: '2.1' },
  { name: 'tickets', task: '2.2' },
  { name: 'ticket_history', task: '2.2' },
  { name: 'ticket_comments', task: '2.2' },
  { name: 'announcement_categories', task: '2.3' },
  { name: 'announcements', task: '2.3' },
  { name: 'assets', task: '2.4' },
  { name: 'workflow_rules', task: '2.5' },
  { name: 'workflow_executions', task: '2.5' },
  { name: 'audit_logs', task: '2.6' },
  { name: 'external_service_status', task: '2.6' },
];

/**
 * Check if a table exists by trying to query it
 */
async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    if (error) {
      // Check if error is about table not existing
      if (error.message.includes('does not exist') || 
          error.message.includes('relation') ||
          error.code === '42P01') {
        return { exists: false, error: error.message };
      }
      // Other errors might mean table exists but we don't have permissions or other issues
      return { exists: true, error: error.message, warning: true };
    }
    
    return { exists: true, error: null };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

/**
 * Get table row count
 */
async function getTableCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return null;
    }
    
    return count;
  } catch (error) {
    return null;
  }
}

/**
 * Check indexes for a table
 */
async function checkIndexes(tableName) {
  // This is a simplified check - we just verify the table is queryable
  // Detailed index checking would require direct database metadata queries
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);
  
  return !error;
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.blue}
╔════════════════════════════════════════════════════════╗
║        FlowOps Database Schema Verification            ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`${colors.cyan}Checking database schema for Task 2: Database schema and migrations${colors.reset}\n`);
  
  let allTablesExist = true;
  let existingTables = [];
  let missingTables = [];
  
  // Check each required table
  for (const table of REQUIRED_TABLES) {
    process.stdout.write(`${colors.blue}⏳ Checking table: ${table.name}...${colors.reset}`);
    
    const result = await checkTable(table.name);
    
    if (result.exists) {
      const count = await getTableCount(table.name);
      const countStr = count !== null ? ` (${count} rows)` : '';
      
      if (result.warning) {
        console.log(`\r${colors.yellow}⚠️  Table exists: ${table.name}${countStr} - ${result.error}${colors.reset}`);
      } else {
        console.log(`\r${colors.green}✓ Table exists: ${table.name}${countStr}${colors.reset}`);
      }
      existingTables.push({ ...table, count });
    } else {
      console.log(`\r${colors.red}✗ Table missing: ${table.name} (Task ${table.task})${colors.reset}`);
      allTablesExist = false;
      missingTables.push(table);
    }
  }
  
  console.log();
  
  // Summary
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════╗
║                    SUMMARY                             ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`Total tables checked: ${REQUIRED_TABLES.length}`);
  console.log(`${colors.green}Tables exist: ${existingTables.length}${colors.reset}`);
  console.log(`${colors.red}Tables missing: ${missingTables.length}${colors.reset}\n`);
  
  if (allTablesExist) {
    console.log(`${colors.green}
╔════════════════════════════════════════════════════════╗
║          ✓ ALL TABLES EXIST                            ║
║     Database schema is ready for use!                  ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);
    
    // Show table statistics
    console.log(`\n${colors.cyan}Table Statistics:${colors.reset}\n`);
    for (const table of existingTables) {
      const countStr = table.count !== null ? table.count : '?';
      console.log(`  • ${table.name.padEnd(25)} ${countStr.toString().padStart(6)} rows`);
    }
    
    console.log(`\n${colors.green}✅ Task 2 (Database schema and migrations) appears to be COMPLETE${colors.reset}`);
    console.log(`${colors.green}✅ Ready to proceed with Phase 2: Authentication & User Management${colors.reset}\n`);
    
  } else {
    console.log(`${colors.red}
╔════════════════════════════════════════════════════════╗
║     ✗ MISSING TABLES - MIGRATIONS NEEDED               ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);
    
    console.log(`\n${colors.yellow}Missing tables that need to be created:${colors.reset}\n`);
    for (const table of missingTables) {
      console.log(`  • ${table.name.padEnd(25)} (Task ${table.task})`);
    }
    
    console.log(`\n${colors.cyan}To apply migrations:${colors.reset}`);
    console.log(`\n1. ${colors.yellow}Option 1: Using Supabase Dashboard${colors.reset}`);
    console.log(`   - Go to: ${process.env.SUPABASE_URL}`);
    console.log(`   - Navigate to: SQL Editor`);
    console.log(`   - Run migration files from: supabase/migrations/`);
    console.log(`   - Run in this order:`);
    console.log(`     1. 20240101000000_create_users_table.sql`);
    console.log(`     2. 20240101000003_create_announcements_tables.sql`);
    console.log(`     3. 20240101000004_create_assets_table.sql`);
    console.log(`     4. 20240102000000_create_tickets_tables.sql`);
    console.log(`     5. 20240102000000_create_workflow_tables.sql`);
    console.log(`     6. 20240103000000_create_audit_logs_and_external_service_status_tables.sql`);
    
    console.log(`\n2. ${colors.yellow}Option 2: Using apply-migrations.js script${colors.reset}`);
    console.log(`   - Run: node apply-migrations.js`);
    console.log(`   - Copy SQL content and paste into Supabase SQL Editor`);
    
    console.log();
  }
}

// Run the check
main()
  .then(() => {
    console.log(`${colors.blue}Schema check complete.${colors.reset}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}
╔════════════════════════════════════════════════════════╗
║              Schema check failed                       ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);
    console.error(error);
    process.exit(1);
  });
