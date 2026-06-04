// User DAO — queries related to user accounts.

const getUserByUsername = async (db, username) => {
  return db.get(
    'SELECT id, username, password_hash, salt FROM users WHERE username = ?',
    username
  );
};

const getUserById = async (db, id) => {
  return db.get('SELECT id, username FROM users WHERE id = ?', id);
};

export { getUserByUsername, getUserById };
