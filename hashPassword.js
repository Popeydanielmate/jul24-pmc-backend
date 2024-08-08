const bcrypt = require('bcryptjs');

const hashPassword = async () => {
  const plainPassword = 'Inglis123';
  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log('Original password:', plainPassword);
  console.log('Manually hashed password:', hashedPassword);
};

hashPassword();
