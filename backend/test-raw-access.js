/**
 * Test Raw Database Access
 * 
 * This tests direct table access to understand RLS and permissions
 */

import { supabase } from './src/config/database.js';

async function test() {
  console.log('Testing direct table access...\n');
  
  // Try users table
  console.log('1. Testing users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  console.log('   Data:', users);
  console.log('   Error:', usersError?.message || 'None');
  console.log('   Error Code:', usersError?.code || 'None');
  console.log('   Error Details:', usersError?.details || 'None');
  console.log();
  
  // Try tickets table
  console.log('2. Testing tickets table...');
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .limit(1);
  
  console.log('   Data:', tickets);
  console.log('   Error:', ticketsError?.message || 'None');
  console.log();
  
  // Try with service role directly
  console.log('3. Testing with service role bypass...');
  const { data: usersService, error: usersServiceError } = await supabase
    .from('users')
    .select('*');
  
  console.log('   Data count:', usersService?.length || 0);
  console.log('   Error:', usersServiceError?.message || 'None');
}

test().catch(console.error);
