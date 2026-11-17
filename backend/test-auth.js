/**
 * Authentication API Test Script
 * Tests the authentication endpoints
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

// Test data
const testUser = {
  email: 'test@flowops.hr',
  password: 'TestPassword123',
  firstName: 'Test',
  lastName: 'User'
};

let authToken = null;

/**
 * Test user registration
 */
async function testRegister() {
  console.log('\n--- Testing User Registration ---');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✓ Registration successful');
    console.log('User:', response.data.user);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    authToken = response.data.token;
    return true;
  } catch (error) {
    if (error.response) {
      console.log('✗ Registration failed:', error.response.data.message);
      // If user already exists, try to login instead
      if (error.response.data.error === 'Korisnik već postoji') {
        console.log('  (User already exists, will try login instead)');
        return false;
      }
    } else {
      console.error('✗ Registration error:', error.message);
    }
    return false;
  }
}

/**
 * Test user login
 */
async function testLogin() {
  console.log('\n--- Testing User Login ---');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✓ Login successful');
    console.log('User:', response.data.user);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    authToken = response.data.token;
    return true;
  } catch (error) {
    if (error.response) {
      console.log('✗ Login failed:', error.response.data.message);
    } else {
      console.error('✗ Login error:', error.message);
    }
    return false;
  }
}

/**
 * Test getting current user profile
 */
async function testGetProfile() {
  console.log('\n--- Testing Get Profile ---');
  if (!authToken) {
    console.log('✗ No auth token available');
    return false;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log('✓ Get profile successful');
    console.log('Profile:', response.data);
    return true;
  } catch (error) {
    if (error.response) {
      console.log('✗ Get profile failed:', error.response.data.message);
    } else {
      console.error('✗ Get profile error:', error.message);
    }
    return false;
  }
}

/**
 * Test logout
 */
async function testLogout() {
  console.log('\n--- Testing Logout ---');
  if (!authToken) {
    console.log('✗ No auth token available');
    return false;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log('✓ Logout successful');
    console.log('Message:', response.data.message);
    return true;
  } catch (error) {
    if (error.response) {
      console.log('✗ Logout failed:', error.response.data.message);
    } else {
      console.error('✗ Logout error:', error.message);
    }
    return false;
  }
}

/**
 * Test invalid credentials
 */
async function testInvalidCredentials() {
  console.log('\n--- Testing Invalid Credentials ---');
  try {
    await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: 'WrongPassword123'
    });
    console.log('✗ Should have failed with invalid credentials');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✓ Correctly rejected invalid credentials');
      console.log('Error message:', error.response.data.message);
      return true;
    } else {
      console.error('✗ Unexpected error:', error.message);
      return false;
    }
  }
}

/**
 * Test password validation
 */
async function testPasswordValidation() {
  console.log('\n--- Testing Password Validation ---');
  try {
    await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'weak@flowops.hr',
      password: 'weak',
      firstName: 'Weak',
      lastName: 'Password'
    });
    console.log('✗ Should have failed with weak password');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ Correctly rejected weak password');
      console.log('Error message:', error.response.data.message);
      return true;
    } else {
      console.error('✗ Unexpected error:', error.message);
      return false;
    }
  }
}

/**
 * Test unauthorized access
 */
async function testUnauthorizedAccess() {
  console.log('\n--- Testing Unauthorized Access ---');
  try {
    await axios.get(`${API_BASE_URL}/auth/me`);
    console.log('✗ Should have failed without token');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✓ Correctly rejected request without token');
      console.log('Error message:', error.response.data.message);
      return true;
    } else {
      console.error('✗ Unexpected error:', error.message);
      return false;
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=================================');
  console.log('Authentication API Test Suite');
  console.log('=================================');
  console.log('API Base URL:', API_BASE_URL);

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test registration
  results.total++;
  const registerSuccess = await testRegister();
  if (registerSuccess) {
    results.passed++;
  } else {
    results.failed++;
    // If registration failed (user exists), try login
    results.total++;
    if (await testLogin()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Test getting profile
  results.total++;
  if (await testGetProfile()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test logout
  results.total++;
  if (await testLogout()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Re-login for remaining tests
  await testLogin();

  // Test invalid credentials
  results.total++;
  if (await testInvalidCredentials()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test password validation
  results.total++;
  if (await testPasswordValidation()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test unauthorized access
  results.total++;
  if (await testUnauthorizedAccess()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Summary
  console.log('\n=================================');
  console.log('Test Results Summary');
  console.log('=================================');
  console.log(`Total tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success rate: ${Math.round((results.passed / results.total) * 100)}%`);
  console.log('=================================\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
