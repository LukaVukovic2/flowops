/**
 * Test Supabase Database Connection
 * 
 * This script tests the Supabase connection configuration
 * Run with: node test-connection.js
 */

import { supabase, testConnection } from './src/config/database.js';

console.log('🔍 Testing Supabase connection...\n');

// Test connection
testConnection()
  .then((success) => {
    if (success) {
      console.log('\n✅ SUCCESS: Supabase connection is working!');
      console.log('✅ Database configuration is correct');
      console.log('✅ Ready to proceed with migrations\n');
      process.exit(0);
    } else {
      console.log('\n❌ FAILED: Could not connect to Supabase');
      console.log('❌ Please check your credentials in backend/.env\n');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ ERROR:', error.message);
    console.log('❌ Please verify:');
    console.log('   - SUPABASE_URL is correct');
    console.log('   - SUPABASE_SERVICE_KEY is correct');
    console.log('   - Your Supabase project is active\n');
    process.exit(1);
  });
