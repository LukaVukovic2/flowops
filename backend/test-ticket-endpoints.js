/**
 * Manual Test Script for Ticket History and Comments Endpoints
 * 
 * This script demonstrates the three implemented endpoints:
 * - GET /api/v1/tickets/:id/history
 * - GET /api/v1/tickets/:id/comments
 * - POST /api/v1/tickets/:id/comments
 * 
 * Prerequisites:
 * 1. Database migrations applied
 * 2. Test user created and authenticated
 * 3. Test ticket created
 * 4. Server running on http://localhost:3000
 * 
 * Usage:
 *   node test-ticket-endpoints.js <ticketId> <authToken>
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

// Get command line arguments
const ticketId = process.argv[2];
const authToken = process.argv[3];

if (!ticketId || !authToken) {
  console.log('❌ Missing required arguments');
  console.log('');
  console.log('Usage: node test-ticket-endpoints.js <ticketId> <authToken>');
  console.log('');
  console.log('Example:');
  console.log('  node test-ticket-endpoints.js 123e4567-e89b-12d3-a456-426614174000 eyJhbGciOiJIUzI1NiIs...');
  process.exit(1);
}

// Configure axios with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});

async function testEndpoints() {
  console.log('🧪 Testing Ticket History and Comments Endpoints');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    // Test 1: Get Ticket History
    console.log('📋 Test 1: GET /api/v1/tickets/:id/history');
    console.log('-'.repeat(60));
    try {
      const historyResponse = await api.get(`/tickets/${ticketId}/history`);
      console.log('✅ Status:', historyResponse.status);
      console.log('📊 History entries:', historyResponse.data.history.length);
      console.log('');
      if (historyResponse.data.history.length > 0) {
        console.log('Sample entry:');
        console.log(JSON.stringify(historyResponse.data.history[0], null, 2));
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 2: Get Ticket Comments
    console.log('💬 Test 2: GET /api/v1/tickets/:id/comments');
    console.log('-'.repeat(60));
    try {
      const commentsResponse = await api.get(`/tickets/${ticketId}/comments`, {
        params: { page: 1, limit: 10 }
      });
      console.log('✅ Status:', commentsResponse.status);
      console.log('📊 Comments:', commentsResponse.data.comments.length);
      console.log('📄 Pagination:', JSON.stringify(commentsResponse.data.pagination, null, 2));
      console.log('');
      if (commentsResponse.data.comments.length > 0) {
        console.log('Sample comment:');
        console.log(JSON.stringify(commentsResponse.data.comments[0], null, 2));
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 3: Add Comment
    console.log('✍️  Test 3: POST /api/v1/tickets/:id/comments');
    console.log('-'.repeat(60));
    try {
      const newComment = {
        content: 'Test komentar iz automatskog testa - ' + new Date().toISOString()
      };
      const createResponse = await api.post(`/tickets/${ticketId}/comments`, newComment);
      console.log('✅ Status:', createResponse.status);
      console.log('📝 Created comment:');
      console.log(JSON.stringify(createResponse.data, null, 2));
      console.log('');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 4: Validation - Empty Content
    console.log('🔍 Test 4: POST with empty content (validation test)');
    console.log('-'.repeat(60));
    try {
      await api.post(`/tickets/${ticketId}/comments`, { content: '' });
      console.log('❌ Should have failed with 400 error');
      console.log('');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected empty content');
        console.log('📋 Error message:', error.response.data.message);
        console.log('');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
        console.log('');
      }
    }

    // Test 5: Non-existent Ticket
    console.log('🔍 Test 5: GET history for non-existent ticket');
    console.log('-'.repeat(60));
    try {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await api.get(`/tickets/${fakeId}/history`);
      console.log('❌ Should have failed with 404 error');
      console.log('');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly returned 404');
        console.log('📋 Error message:', error.response.data.message);
        console.log('');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
        console.log('');
      }
    }

    console.log('='.repeat(60));
    console.log('✅ All tests completed');
    console.log('');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testEndpoints().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
