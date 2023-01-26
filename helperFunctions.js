const generateRandomString = function() {
  //--> Generates a random string of 6 alpha-numeric characters.
  return Math.random().toString(36).slice(2, 8);
};

const deleteFromDB = function(db, key) {
  // --> Deletes a sepcified item from database.
  delete db[key];
};


const findUserByEmail = function(userDB, email) {
  for (const user in userDB) {
    if (userDB[user].email === email) {
      return userDB[user];
    }
  };
  return null;
};

const urlsForUser = function(urlDB, userID) {
  let userURLs = {};
  // Bug In Here.
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