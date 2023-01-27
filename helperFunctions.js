// ==============================================================================================================
//                                       HELPER FUNCTIONS
// ==============================================================================================================
/**
 * Generates a random string of 6 alpha-numeric characters.
 * @returns {string} id;
 */
const generateRandomString = function() {
  const id = Math.random().toString(36).slice(2, 8);
  return id;
};

/**
 * Delete an item from a database.
 * @param {object} db 
 * @param {string} key 
 */
const deleteFromDB = function(db, key) {
  delete db[key];
};

/**
 * Finds a user in the database by email.
 * @param {object} userDB 
 * @param {string} email 
 * @returns {object} userDB[user] or null;
 */
const findUserByEmail = function(userDB, email) {
  for (const user in userDB) {
    if (userDB[user].email === email) {
      return userDB[user];
    }
  }
  return null;
};

/**
 * Finds all urls assigned to specific user
 * @param {object} urlDB 
 * @param {string} userID 
 * @returns {object} userURLS;
 */
const urlsForUser = function(urlDB, userID) {
  let userURLs = {};
  for (const url in urlDB) {
    if (urlDB[url].userID === userID) {
      userURLs[url] = {
        longURL: urlDB[url].longURL
      };
    }
  }
  return userURLs;
};


module.exports = { generateRandomString, deleteFromDB, findUserByEmail, urlsForUser };