/**
 * Database Configuration
 * Configures Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: ws
  }
});

// Test database connection
export async function testConnection() {
  try {
    // Try to query system tables instead of application tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      // If we get a permission error or schema error, try a simpler test
      // Just check if we can make a request to Supabase
      const { error: healthError } = await supabase.rpc('version');
      
      if (healthError && healthError.code === 'PGRST202') {
        // Function not found is actually good - means we can connect
        console.log('✓ Database connection successful');
        return true;
      }
      
      console.error('Database connection test failed:', error.message);
      return false;
    }
    
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
}

export default supabase;
