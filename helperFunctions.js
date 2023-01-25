const generateRandomString = function() {
  //--> Generates a random string of 6 alpha-numeric characters.
  return Math.random().toString(36).slice(2, 8);
};

const deleteFromDB = function(db, key) {
  // --> Deletes a sepcified item from database.
  delete db[key];
};

const fetchURLById = function(db, id) {
  return db[id];
};


const findUserByEmail = function(userDB, email) {
  for (const user in userDB) {
    if (userDB[user].email === email) {
      return userDB[user];
    }
  };
  return null;
};





module.exports = { generateRandomString, deleteFromDB, fetchURLById, findUserByEmail };