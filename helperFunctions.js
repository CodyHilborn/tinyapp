const generateRandomString = function() {
  //--> Generates a random string of 6 alpha-numeric characters.
  return Math.random().toString(36).slice(2, 8);
};

const deleteURL = function(db, key) {
  // --> Deletes a sepcified item from database.
  delete db[key];
};

const fetchURLbyId = function(db, id) {
  return db[id];
};

module.exports = { generateRandomString, deleteURL, fetchURLbyId };