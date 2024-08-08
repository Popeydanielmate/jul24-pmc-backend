const bcrypt = require('bcryptjs');

const compareStoredPassword = async () => {
  const plainPassword = 'Inglis123';
  const storedHashedPassword = '$2a$10$F7D9i53xhzMjm5ToBZL6GehkNFFMZJ8eelCdQZpC7mYCs4HAHU0uS'; // Use the hashed password stored in the database

  const isMatch = await bcrypt.compare(plainPassword, storedHashedPassword);
  console.log('Password match:', isMatch);
};

compareStoredPassword();
