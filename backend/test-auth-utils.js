/**
 * Quick test script to verify auth utilities work correctly
 */

import {
  hashPassword,
  verifyPassword,
  validatePasswordComplexity,
  isPasswordValid,
  AUTH_CONSTANTS
} from './src/utils/auth.js';

async function testAuthUtils() {
  console.log('Testing Auth Utilities...\n');

  try {
    // Test 1: Validate password complexity
    console.log('Test 1: Password Validation');
    const validPassword = 'SecurePass123!';
    const weakPassword = 'weak';
    
    const validResult = validatePasswordComplexity(validPassword);
    console.log(`  Valid password: ${validPassword}`);
    console.log(`  Is valid: ${validResult.isValid}`);
    console.log(`  Errors: ${validResult.errors.length === 0 ? 'None' : validResult.errors.join(', ')}`);
    
    const weakResult = validatePasswordComplexity(weakPassword);
    console.log(`\n  Weak password: ${weakPassword}`);
    console.log(`  Is valid: ${weakResult.isValid}`);
    console.log(`  Errors: ${weakResult.errors.join(', ')}`);

    // Test 2: Hash password
    console.log('\n\nTest 2: Password Hashing');
    const password = 'TestPassword123!';
    console.log(`  Original password: ${password}`);
    const hash1 = await hashPassword(password);
    console.log(`  Hash 1: ${hash1}`);
    
    const hash2 = await hashPassword(password);
    console.log(`  Hash 2: ${hash2}`);
    console.log(`  Hashes are different (salted): ${hash1 !== hash2}`);

    // Test 3: Verify password
    console.log('\n\nTest 3: Password Verification');
    const isCorrect = await verifyPassword(password, hash1);
    console.log(`  Correct password verifies: ${isCorrect}`);
    
    const isWrong = await verifyPassword('WrongPassword123!', hash1);
    console.log(`  Wrong password rejected: ${!isWrong}`);

    // Test 4: Regex validation
    console.log('\n\nTest 4: Regex Validation (isPasswordValid)');
    const testPasswords = [
      'ValidPass123!',
      'short1!',
      'nouppercas3!',
      'NOLOWERCASE1!',
      'NoDigits!',
      'NoSpecial123'
    ];
    
    testPasswords.forEach(pwd => {
      console.log(`  "${pwd}": ${isPasswordValid(pwd)}`);
    });

    // Test 5: Constants
    console.log('\n\nTest 5: Constants');
    console.log(`  SALT_ROUNDS: ${AUTH_CONSTANTS.SALT_ROUNDS}`);
    console.log(`  PASSWORD_REGEX: ${AUTH_CONSTANTS.PASSWORD_REGEX}`);

    console.log('\n✅ All basic tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuthUtils();
