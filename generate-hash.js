const bcrypt = require('bcryptjs');

// Function to hash password (same as your auth.ts implementation)
async function generateHash(password) {
  try {
    const saltRounds = 10; // Same as auth.ts
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error('Hashing error:', error);
    process.exit(1);
  }
}

// Main execution
(async () => {
  // Get password from command line or use default
  const password = process.argv[2] || '123'; 
  
  console.log(`Generating hash for password: "${password}"`);
  console.log('(Using same settings as auth.ts - 10 salt rounds)');
  
  const hash = await generateHash(password);
  
  console.log('\nGenerated bcrypt hash:');
  console.log(hash);
  
//   console.log('\nVerification test:');
//   const isValid = await bcrypt.compare(password, hash);
//   console.log(`Password matches hash: ${isValid ? 'YES' : 'NO'}`);
})();