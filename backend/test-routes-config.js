/**
 * Test Route Configuration
 * Verifies routes are properly configured without running server
 */

import announcementRoutes from './src/routes/announcements.routes.js';

console.log('=== Testing Route Configuration ===\n');

console.log('1. Checking imports...');
console.log(`   ✓ Announcement routes imported: ${typeof announcementRoutes}`);

console.log('\n2. Checking route stack...');
const routes = announcementRoutes.stack
  .filter(r => r.route)
  .map(r => ({
    path: r.route.path,
    methods: Object.keys(r.route.methods)
  }));

console.log(`   Found ${routes.length} routes:`);
routes.forEach(r => {
  console.log(`   ${r.methods.map(m => m.toUpperCase()).join(', ')} ${r.path}`);
});

// Check for expected routes
const expectedRoutes = [
  { path: '/categories', method: 'get' },
  { path: '/categories', method: 'post' },
  { path: '/categories/:id', method: 'get' },
  { path: '/categories/:id', method: 'put' },
  { path: '/categories/:id', method: 'delete' },
  { path: '/', method: 'get' },
  { path: '/', method: 'post' },
  { path: '/:id', method: 'get' },
  { path: '/:id', method: 'put' },
  { path: '/:id', method: 'delete' },
  { path: '/:id/publish', method: 'patch' }
];

console.log('\n3. Verifying expected routes...');
let allFound = true;
expectedRoutes.forEach(expected => {
  const found = routes.some(r => 
    r.path === expected.path && 
    r.methods.includes(expected.method)
  );
  if (found) {
    console.log(`   ✓ ${expected.method.toUpperCase()} ${expected.path}`);
  } else {
    console.log(`   ✗ MISSING: ${expected.method.toUpperCase()} ${expected.path}`);
    allFound = false;
  }
});

if (allFound) {
  console.log('\n✓ All expected routes are configured correctly!');
  console.log('\n=== Route Structure ===');
  console.log('Categories:');
  console.log('  GET    /api/v1/announcements/categories');
  console.log('  POST   /api/v1/announcements/categories (Admin only)');
  console.log('  GET    /api/v1/announcements/categories/:id');
  console.log('  PUT    /api/v1/announcements/categories/:id (Admin only)');
  console.log('  DELETE /api/v1/announcements/categories/:id (Admin only)');
  console.log('\nAnnouncements:');
  console.log('  GET    /api/v1/announcements');
  console.log('  POST   /api/v1/announcements (Tehničar/Admin)');
  console.log('  GET    /api/v1/announcements/:id');
  console.log('  PUT    /api/v1/announcements/:id (Tehničar/Admin)');
  console.log('  PATCH  /api/v1/announcements/:id/publish (Tehničar/Admin)');
  console.log('  DELETE /api/v1/announcements/:id (Tehničar/Admin)');
} else {
  console.log('\n✗ Some routes are missing!');
  process.exit(1);
}
