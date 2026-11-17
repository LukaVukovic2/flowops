/**
 * Announcement API Test Script
 * Tests all announcement and category endpoints
 * Run with: node test-announcements-api.js
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Store tokens and IDs for testing
let adminToken = null;
let tehnicarToken = null;
let korisnikToken = null;
let categoryId = null;
let announcementId = null;
let tehnicarAnnouncementId = null;

/**
 * Log test result
 */
function logTest(name, passed, error = null) {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  console.log(`${status} - ${name}`);
  if (error) {
    console.log(`  Error: ${error}`);
  }
  results.tests.push({ name, passed, error });
  if (passed) results.passed++;
  else results.failed++;
}

/**
 * Test helper function
 */
async function test(name, fn) {
  try {
    await fn();
    logTest(name, true);
  } catch (error) {
    logTest(name, false, error.message);
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log('\n=== FlowOps Announcement API Tests ===\n');

  // =======================
  // Setup: Get auth tokens
  // =======================
  console.log('--- Setup: Authentication ---');

  await test('Login as Administrator', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@flowops.com',
      password: 'Admin123!@#'
    });
    if (!response.data.token) throw new Error('No token received');
    adminToken = response.data.token;
  });

  await test('Login as Tehničar', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'tehnicar@flowops.com',
      password: 'Tehnicar123!@#'
    });
    if (!response.data.token) throw new Error('No token received');
    tehnicarToken = response.data.token;
  });

  await test('Login as Registrirani_Korisnik', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'korisnik@flowops.com',
      password: 'Korisnik123!@#'
    });
    if (!response.data.token) throw new Error('No token received');
    korisnikToken = response.data.token;
  });

  // ================================
  // Category Management Tests
  // ================================
  console.log('\n--- Category Management Tests ---');

  await test('Get categories (public - no auth)', async () => {
    const response = await axios.get(`${API_BASE_URL}/announcements/categories`);
    if (!response.data.success) throw new Error('Request failed');
    if (!Array.isArray(response.data.data)) throw new Error('Expected array of categories');
  });

  await test('Create category as Administrator', async () => {
    const response = await axios.post(
      `${API_BASE_URL}/announcements/categories`,
      {
        name: 'Test Kategorija',
        description: 'Opis test kategorije',
        color: '#FF5733'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    if (!response.data.data.id) throw new Error('No category ID returned');
    categoryId = response.data.data.id;
  });

  await test('Get category by ID', async () => {
    const response = await axios.get(`${API_BASE_URL}/announcements/categories/${categoryId}`);
    if (!response.data.success) throw new Error('Request failed');
    if (response.data.data.name !== 'Test Kategorija') throw new Error('Category name mismatch');
  });

  await test('Create category as Tehničar (should fail)', async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/announcements/categories`,
        {
          name: 'Unauthorized Category',
          description: 'Should not be created'
        },
        { headers: { Authorization: `Bearer ${tehnicarToken}` } }
      );
      throw new Error('Should have been forbidden');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Expected 403, got ${error.response?.status}`);
      }
    }
  });

  await test('Update category as Administrator', async () => {
    const response = await axios.put(
      `${API_BASE_URL}/announcements/categories/${categoryId}`,
      {
        description: 'Ažurirani opis'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    if (response.data.data.description !== 'Ažurirani opis') {
      throw new Error('Description not updated');
    }
  });

  // ================================
  // Announcement Management Tests
  // ================================
  console.log('\n--- Announcement Management Tests ---');

  await test('Get announcements (public - should only see published)', async () => {
    const response = await axios.get(`${API_BASE_URL}/announcements`);
    if (!response.data.success) throw new Error('Request failed');
    if (!Array.isArray(response.data.data)) throw new Error('Expected array');
  });

  await test('Create announcement as Tehničar', async () => {
    const response = await axios.post(
      `${API_BASE_URL}/announcements`,
      {
        title: 'Test Obavijest od Tehničara',
        content: 'Sadržaj test obavijesti koja je kreirana od strane tehničara.',
        categoryId: categoryId,
        imageUrl: 'https://example.com/image.jpg'
      },
      { headers: { Authorization: `Bearer ${tehnicarToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    if (!response.data.data.id) throw new Error('No announcement ID returned');
    if (response.data.data.is_published) throw new Error('Should be unpublished by default');
    tehnicarAnnouncementId = response.data.data.id;
  });

  await test('Create announcement as Administrator', async () => {
    const response = await axios.post(
      `${API_BASE_URL}/announcements`,
      {
        title: 'Test Obavijest od Administratora',
        content: 'Sadržaj test obavijesti.',
        categoryId: categoryId
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    announcementId = response.data.data.id;
  });

  await test('Create announcement as Registrirani_Korisnik (should fail)', async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/announcements`,
        {
          title: 'Unauthorized Announcement',
          content: 'Should not be created'
        },
        { headers: { Authorization: `Bearer ${korisnikToken}` } }
      );
      throw new Error('Should have been forbidden');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Expected 403, got ${error.response?.status}`);
      }
    }
  });

  await test('Get announcement by ID (unpublished - should fail for public)', async () => {
    try {
      await axios.get(`${API_BASE_URL}/announcements/${announcementId}`);
      throw new Error('Should not see unpublished announcement');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Expected 404, got ${error.response?.status}`);
      }
    }
  });

  await test('Get announcement by ID (unpublished - Tehničar can see)', async () => {
    const response = await axios.get(
      `${API_BASE_URL}/announcements/${tehnicarAnnouncementId}`,
      { headers: { Authorization: `Bearer ${tehnicarToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    if (response.data.data.id !== tehnicarAnnouncementId) throw new Error('ID mismatch');
  });

  await test('Update own announcement as Tehničar', async () => {
    const response = await axios.put(
      `${API_BASE_URL}/announcements/${tehnicarAnnouncementId}`,
      {
        title: 'Ažurirana Test Obavijest'
      },
      { headers: { Authorization: `Bearer ${tehnicarToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    if (response.data.data.title !== 'Ažurirana Test Obavijest') {
      throw new Error('Title not updated');
    }
  });

  await test('Update other\'s announcement as Tehničar (should fail)', async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/announcements/${announcementId}`,
        { title: 'Unauthorized Update' },
        { headers: { Authorization: `Bearer ${tehnicarToken}` } }
      );
      throw new Error('Should have been forbidden');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Expected 403, got ${error.response?.status}`);
      }
    }
  });

  await test('Update any announcement as Administrator', async () => {
    const response = await axios.put(
      `${API_BASE_URL}/announcements/${tehnicarAnnouncementId}`,
      {
        content: 'Ažuriran sadržaj od admina'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
  });

  await test('Publish announcement as Tehničar (own announcement)', async () => {
    const response = await axios.patch(
      `${API_BASE_URL}/announcements/${tehnicarAnnouncementId}/publish`,
      { publish: true },
      { headers: { Authorization: `Bearer ${tehnicarToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    if (!response.data.data.is_published) throw new Error('Not published');
    if (!response.data.data.published_at) throw new Error('No published_at timestamp');
  });

  await test('Publish announcement as Administrator', async () => {
    const response = await axios.patch(
      `${API_BASE_URL}/announcements/${announcementId}/publish`,
      { publish: true },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    if (!response.data.data.is_published) throw new Error('Not published');
  });

  await test('Get published announcement (public access)', async () => {
    const response = await axios.get(`${API_BASE_URL}/announcements/${announcementId}`);
    if (!response.data.success) throw new Error('Request failed');
    if (!response.data.data.is_published) throw new Error('Should be published');
  });

  await test('Update published announcement as Tehničar (should fail)', async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/announcements/${tehnicarAnnouncementId}`,
        { title: 'Cannot Update Published' },
        { headers: { Authorization: `Bearer ${tehnicarToken}` } }
      );
      throw new Error('Should not be able to update published announcement');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Expected 403, got ${error.response?.status}`);
      }
    }
  });

  await test('Unpublish announcement as Administrator', async () => {
    const response = await axios.patch(
      `${API_BASE_URL}/announcements/${announcementId}/publish`,
      { publish: false },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    if (response.data.data.is_published) throw new Error('Still published');
  });

  await test('Filter announcements by category', async () => {
    // Publish tehnicar announcement first
    await axios.patch(
      `${API_BASE_URL}/announcements/${tehnicarAnnouncementId}/publish`,
      { publish: true },
      { headers: { Authorization: `Bearer ${tehnicarToken}` } }
    );

    const response = await axios.get(`${API_BASE_URL}/announcements?categoryId=${categoryId}`);
    if (!response.data.success) throw new Error('Request failed');
    if (response.data.data.length === 0) throw new Error('No announcements in category');
  });

  await test('Get all announcements as Tehničar (including unpublished)', async () => {
    const response = await axios.get(
      `${API_BASE_URL}/announcements`,
      { headers: { Authorization: `Bearer ${tehnicarToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
    // Should see both published and unpublished
  });

  await test('Delete own announcement as Tehničar', async () => {
    const response = await axios.delete(
      `${API_BASE_URL}/announcements/${tehnicarAnnouncementId}`,
      { headers: { Authorization: `Bearer ${tehnicarToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
  });

  await test('Verify deleted announcement is not visible', async () => {
    try {
      await axios.get(`${API_BASE_URL}/announcements/${tehnicarAnnouncementId}`);
      throw new Error('Should not see deleted announcement');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Expected 404, got ${error.response?.status}`);
      }
    }
  });

  await test('Delete any announcement as Administrator', async () => {
    const response = await axios.delete(
      `${API_BASE_URL}/announcements/${announcementId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
  });

  await test('Delete category as Administrator', async () => {
    const response = await axios.delete(
      `${API_BASE_URL}/announcements/categories/${categoryId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Request failed');
  });

  // =======================
  // Validation Tests
  // =======================
  console.log('\n--- Validation Tests ---');

  await test('Create announcement without title (should fail)', async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/announcements`,
        {
          content: 'Content without title'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      throw new Error('Should have failed validation');
    } catch (error) {
      if (error.response?.status !== 400) {
        throw new Error(`Expected 400, got ${error.response?.status}`);
      }
      if (!error.response?.data.message.includes('Naslov')) {
        throw new Error('Should have Croatian error message about title');
      }
    }
  });

  await test('Create announcement with invalid image URL (should fail)', async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/announcements`,
        {
          title: 'Test',
          content: 'Content',
          imageUrl: 'not-a-valid-url'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      throw new Error('Should have failed validation');
    } catch (error) {
      if (error.response?.status !== 400) {
        throw new Error(`Expected 400, got ${error.response?.status}`);
      }
    }
  });

  await test('Create category with invalid color (should fail)', async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/announcements/categories`,
        {
          name: 'Test',
          color: 'not-a-hex-color'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      throw new Error('Should have failed validation');
    } catch (error) {
      if (error.response?.status !== 400) {
        throw new Error(`Expected 400, got ${error.response?.status}`);
      }
    }
  });

  // =======================
  // Print Results
  // =======================
  console.log('\n=== Test Results ===');
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✓ Passed: ${results.passed}`);
  console.log(`✗ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n=== Failed Tests ===');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`- ${t.name}: ${t.error}`));
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n✗ Test suite failed with error:', error.message);
  process.exit(1);
});
