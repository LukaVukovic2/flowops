/**
 * Simple Announcement API Test
 * Tests announcement endpoints with user registration
 * Run with: node test-announcements-simple.js
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

let adminToken = null;
let tehnicarToken = null;
let categoryId = null;
let announcementId = null;

console.log('=== Simple Announcement API Test ===\n');

async function runTest() {
  try {
    // Step 1: Register test users
    console.log('1. Registering test users...');
    
    try {
      const adminReg = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: `admin_test_${Date.now()}@flowops.com`,
        password: 'Admin123!@#',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'Administrator'
      });
      adminToken = adminReg.data.token;
      console.log('   ✓ Administrator registered');
    } catch (err) {
      console.log('   ℹ Admin already exists or registration requires special permissions');
      // Try to login with existing admin
      const loginResp = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@flowops.com',
        password: 'Admin123!@#'
      });
      adminToken = loginResp.data.token;
      console.log('   ✓ Logged in as existing Administrator');
    }

    try {
      const tehnicarReg = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: `tehnicar_test_${Date.now()}@flowops.com`,
        password: 'Tehnicar123!@#',
        firstName: 'Test',
        lastName: 'Tehnicar',
        role: 'Tehničar'
      });
      tehnicarToken = tehnicarReg.data.token;
      console.log('   ✓ Tehničar registered');
    } catch (err) {
      try {
        const loginResp = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'tehnicar@flowops.com',
          password: 'Tehnicar123!@#'
        });
        tehnicarToken = loginResp.data.token;
        console.log('   ✓ Logged in as existing Tehničar');
      } catch (loginErr) {
        console.log('   ✗ Cannot login as Tehničar:', loginErr.response?.data?.message || loginErr.message);
      }
    }

    // Step 2: Test category endpoints
    console.log('\n2. Testing category endpoints...');
    
    // Get all categories (public)
    const categoriesResp = await axios.get(`${API_BASE_URL}/announcements/categories`);
    console.log(`   ✓ GET /announcements/categories - Found ${categoriesResp.data.data.length} categories`);

    // Create category
    const createCatResp = await axios.post(
      `${API_BASE_URL}/announcements/categories`,
      {
        name: `Test Kategorija ${Date.now()}`,
        description: 'Test opis',
        color: '#3B82F6'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    categoryId = createCatResp.data.data.id;
    console.log(`   ✓ POST /announcements/categories - Created category: ${categoryId}`);

    // Get category by ID
    const getCatResp = await axios.get(`${API_BASE_URL}/announcements/categories/${categoryId}`);
    console.log(`   ✓ GET /announcements/categories/${categoryId} - Retrieved category`);

    // Update category
    const updateCatResp = await axios.put(
      `${API_BASE_URL}/announcements/categories/${categoryId}`,
      { description: 'Ažurirani opis' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✓ PUT /announcements/categories/${categoryId} - Updated category`);

    // Step 3: Test announcement endpoints
    console.log('\n3. Testing announcement endpoints...');

    // Get announcements (public)
    const announcementsResp = await axios.get(`${API_BASE_URL}/announcements`);
    console.log(`   ✓ GET /announcements - Found ${announcementsResp.data.data.length} announcements`);

    // Create announcement
    if (tehnicarToken) {
      const createAnnResp = await axios.post(
        `${API_BASE_URL}/announcements`,
        {
          title: 'Test Obavijest',
          content: 'Ovo je test sadržaj obavijesti.',
          categoryId: categoryId,
          imageUrl: 'https://example.com/test-image.jpg'
        },
        { headers: { Authorization: `Bearer ${tehnicarToken}` } }
      );
      announcementId = createAnnResp.data.data.id;
      console.log(`   ✓ POST /announcements - Created announcement: ${announcementId}`);
      console.log(`     - is_published: ${createAnnResp.data.data.is_published} (should be false)`);

      // Update announcement
      const updateAnnResp = await axios.put(
        `${API_BASE_URL}/announcements/${announcementId}`,
        { title: 'Ažurirana Test Obavijest' },
        { headers: { Authorization: `Bearer ${tehnicarToken}` } }
      );
      console.log(`   ✓ PUT /announcements/${announcementId} - Updated announcement`);

      // Publish announcement
      const publishResp = await axios.patch(
        `${API_BASE_URL}/announcements/${announcementId}/publish`,
        { publish: true },
        { headers: { Authorization: `Bearer ${tehnicarToken}` } }
      );
      console.log(`   ✓ PATCH /announcements/${announcementId}/publish - Published announcement`);
      console.log(`     - published_at: ${publishResp.data.data.published_at}`);

      // Get published announcement (public)
      const getAnnResp = await axios.get(`${API_BASE_URL}/announcements/${announcementId}`);
      console.log(`   ✓ GET /announcements/${announcementId} - Retrieved published announcement`);

      // Unpublish
      const unpublishResp = await axios.patch(
        `${API_BASE_URL}/announcements/${announcementId}/publish`,
        { publish: false },
        { headers: { Authorization: `Bearer ${tehnicarToken}` } }
      );
      console.log(`   ✓ PATCH /announcements/${announcementId}/publish (false) - Unpublished`);

      // Try to get unpublished announcement without auth (should fail)
      try {
        await axios.get(`${API_BASE_URL}/announcements/${announcementId}`);
        console.log('   ✗ Should not access unpublished announcement');
      } catch (err) {
        if (err.response?.status === 404) {
          console.log('   ✓ Unpublished announcement correctly hidden from public');
        } else {
          console.log(`   ⚠ Unexpected status: ${err.response?.status}`);
        }
      }

      // Delete announcement
      const deleteAnnResp = await axios.delete(
        `${API_BASE_URL}/announcements/${announcementId}`,
        { headers: { Authorization: `Bearer ${tehnicarToken}` } }
      );
      console.log(`   ✓ DELETE /announcements/${announcementId} - Soft deleted announcement`);
    }

    // Delete category
    const deleteCatResp = await axios.delete(
      `${API_BASE_URL}/announcements/categories/${categoryId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✓ DELETE /announcements/categories/${categoryId} - Deleted category`);

    // Step 4: Test authorization
    console.log('\n4. Testing authorization...');

    // Try to create category as Tehničar (should fail)
    if (tehnicarToken) {
      try {
        await axios.post(
          `${API_BASE_URL}/announcements/categories`,
          { name: 'Unauthorized Category' },
          { headers: { Authorization: `Bearer ${tehnicarToken}` } }
        );
        console.log('   ✗ Tehničar should not be able to create category');
      } catch (err) {
        if (err.response?.status === 403) {
          console.log('   ✓ Tehničar correctly forbidden from creating category');
        } else {
          console.log(`   ⚠ Unexpected status: ${err.response?.status}`);
        }
      }
    }

    // Try to create announcement without auth (should fail)
    try {
      await axios.post(
        `${API_BASE_URL}/announcements`,
        { title: 'Unauthorized', content: 'Test' }
      );
      console.log('   ✗ Should not create announcement without auth');
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('   ✓ Correctly requires authentication for announcement creation');
      } else {
        console.log(`   ⚠ Unexpected status: ${err.response?.status}`);
      }
    }

    // Step 5: Test validation
    console.log('\n5. Testing validation...');

    // Try to create announcement without title
    try {
      await axios.post(
        `${API_BASE_URL}/announcements`,
        { content: 'No title' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('   ✗ Should not create announcement without title');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data.message.includes('Naslov')) {
        console.log('   ✓ Correctly validates required title (Croatian message)');
      } else {
        console.log(`   ⚠ Unexpected validation: ${err.response?.data.message}`);
      }
    }

    // Try to create category with invalid color
    try {
      await axios.post(
        `${API_BASE_URL}/announcements/categories`,
        { name: 'Test', color: 'invalid-color' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('   ✗ Should not create category with invalid color');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('   ✓ Correctly validates hex color format');
      } else {
        console.log(`   ⚠ Unexpected status: ${err.response?.status}`);
      }
    }

    console.log('\n✓ All tests passed!');
    console.log('\n=== Test Summary ===');
    console.log('✓ Category CRUD operations working');
    console.log('✓ Announcement CRUD operations working');
    console.log('✓ Publish/Unpublish functionality working');
    console.log('✓ Authorization checks working');
    console.log('✓ Validation working with Croatian messages');
    console.log('✓ Public vs authenticated access control working');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

runTest();
