const bcrypt = require('bcryptjs');

const comparePasswords = async () => {
  const plainPassword = 'Inglis123';
  const hashedPassword = '$2a$10$vC6MPHJ7n2oeh4ebGPQ3beIStbnfqUobLMNWM7R/fRbQWz4Z1zevS'; 

  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Password match:', isMatch);
};

comparePasswords();

