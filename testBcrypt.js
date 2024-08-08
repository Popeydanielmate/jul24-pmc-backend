const bcrypt = require('bcryptjs');

const testBcrypt = async () => {
  const plainPassword = 'Inglis123';
  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log('Original password:', plainPassword);
  console.log('Hashed password:', hashedPassword);

  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Password match:', isMatch);
};

testBcrypt();
