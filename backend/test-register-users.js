/**
 * Register test users for announcement testing
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function registerUsers() {
  console.log('=== Registering Test Users ===\n');

  const users = [
    {
      email: 'admin@flowops.com',
      password: 'Admin123!@#',
      firstName: 'Admin',
      lastName: 'User',
      role: 'Administrator'
    },
    {
      email: 'tehnicar@flowops.com',
      password: 'Tehnicar123!@#',
      firstName: 'Tehničar',
      lastName: 'User',
      role: 'Tehničar'
    },
    {
      email: 'korisnik@flowops.com',
      password: 'Korisnik123!@#',
      firstName: 'Korisnik',
      lastName: 'User',
      role: 'Registrirani_Korisnik'
    }
  ];

  for (const user of users) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, user);
      console.log(`✓ Registered ${user.role}: ${user.email}`);
      console.log(`  Token: ${response.data.token.substring(0, 20)}...`);
    } catch (error) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('već postoji')) {
        console.log(`ℹ User already exists: ${user.email}`);
      } else {
        console.log(`✗ Failed to register ${user.email}:`, error.response?.data?.message || error.message);
      }
    }
  }

  console.log('\n=== Testing Login ===\n');

  for (const user of users) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      console.log(`✓ Login successful: ${user.email}`);
      console.log(`  Token: ${response.data.token.substring(0, 20)}...`);
      console.log(`  User ID: ${response.data.user.id}`);
      console.log(`  Role: ${response.data.user.role}`);
    } catch (error) {
      console.log(`✗ Failed to login ${user.email}:`, error.response?.data?.message || error.message);
    }
  }
}

registerUsers().catch(console.error);
