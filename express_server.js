// ==============================================================================================================
//                                       IMPORTS & SERVER CONFIG
// ==============================================================================================================
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const { generateRandomString, deleteFromDB, findUserByEmail, urlsForUser } = require('./helperFunctions');

// ==============================================================================================================
//                                         MIDDLEWARE CONFIG
// ==============================================================================================================

// --> Middleware code to parse the body for POST requests.
app.use(express.urlencoded({ extended: true }));

// Morgan middleware for logging to console.
app.use(morgan('dev'));

// --> Cookie Session middleware
app.use(cookieSession({
  name: 'session',
  keys: [
    'the arsonist has oddly shaped feet',
    'the human torch was denied a bank loan'
  ]
}));

// ==============================================================================================================
//                                        USER & URL DATABASES
// ==============================================================================================================


const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'g2x5V4'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'g2x5V4'
  }
};


const users = {
  'g2x5V4': {
    id: 'g2x5V4',
    email: 'user@example.com',
    password: 'purple'
  },
  'p4V3f9': {
    id: 'p4V3f9',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};


// ==============================================================================================================
//                                     ROUTING & REQUEST HANDLERS
// ==============================================================================================================
/////////// HOME //////////////////////////////////////////////////////////////////////////////////

// ***** HOME PAGE *****
app.get('/', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.redirect('/login');
  }

  res.redirect('/urls');
});
// ***

////////// REGISTER //////////////////////////////////////////////////////////////////////////////////////


// ***** REGISTRATION PAGE *****
app.get('/register', (req, res) => {

  // Assign value of user to appropriate object in userDB.
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID]
  };

  // --> If user IS already registered, redirect to urls page.
  if (userID) {
    return res.redirect('/urls');
  }
  // --> If user is NOT already registered, render the register page.
  return res.render('register', templateVars);

});
// ***


// ***** REGISTRATION FORM POST REQUEST *****
app.post('/register', (req, res) => {

  // --> Handles register post request to add new user to usersDB.
  const newUserID = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  // --> Take new password and hash it.
  const hashedPassword = bcrypt.hashSync(newPassword, salt);

  const foundUser = findUserByEmail(users, newEmail);

  //  --> Checks if email or password field was left empty, returns error if so.
  if (newEmail === '' || newPassword === '') {
    return res.status(400).send(`Status Code ${res.statusCode}: Email or Password field empty!`);
  }

  // --> Checks if email has already been registered to a user.
  if (foundUser) {
    return res.status(400).send(`Status Code ${res.statusCode}: ${newEmail} has already been registered. Try again!`);
  }

  // --> If no errors, adds user to DB and logs in.
  users[newUserID] = {
    id: newUserID,
    email: newEmail,
    password: hashedPassword,
  };

  req.session.user_id = newUserID;
  return res.redirect('/urls');
});
// ***


////////// LOGIN & LOGOUT /////////////////////////////////////////////////////////////////////////////////////

// ***** LOGIN PAGE *****
app.get('/login', (req, res) => {

  // Assign value of user to appropriate object in userDB.
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID]
  };

  // --> If user IS already logged in, redirect to urls.
  if (userID) {
    return res.redirect('/urls');
  }
  // --> If user is NOT already logged in, render login page.
  return res.render('login', templateVars);

});
// ***


// ***** POST REQUEST FOR USER LOGIN *****
app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const foundUser = findUserByEmail(users, loginEmail);


  // If there's no match for login email, respond w/ 403 status code
  if (!foundUser) {
    return res.status(403).send(`Status Code ${res.statusCode}: Email not yet registered!`);
  }

  // Email match? check password match also.
  // No password match? 403 status code and response.
  if (!bcrypt.compareSync(loginPassword, foundUser.password)) {
    return res.status(403).send(`Status Code ${res.statusCode}: Password is incorrect!`);
  }

  // email and password match? Set cookie to existing users ID and redirect to /urls.
  req.session.user_id = foundUser.id;
  return res.redirect('/urls');

});
// ***

// ***** POST REQUEST FOR LOGOUT BUTTON *****
app.post('/logout', (req, res) => {
  // --> Clears user_id cookie and redirects to urls page.
  res.clearCookie('session.sig');
  res.clearCookie('session');
  return res.redirect('/login');
});
// ***

////// URL PAGES /////////////////////////////////////////////////////////////////////////////////////////


// ***** MyURL'S PAGE *****
app.get('/urls', (req, res) => {
  // --> Get route for MyURLs tab, showing table of previoiusly created TinyURLS and corresponding long URLs

  const userID = req.session.user_id;
  const urls = urlsForUser(urlDatabase, userID);

  const templateVars = {
    urls,
    user: users[userID]
  };

  // --> If user isn't logged in, send error message.
  if (!userID) {
    return res.status(403).send(`Status Code ${res.statusCode}: Please sign in if you wish to view this page.`);
  }
  // --> If no error, render MyUrls page.
  return res.render('urls_index', templateVars);

});

// ***

// ***** CREATE NEW URL/FORM PAGE *****
app.get('/urls/new', (req, res) => {
  //  --> Get route for the Create TinyURL page w/ form.
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID]
  };

  // --> If not logged in, redirect to login page.
  if (!userID) {
    return res.redirect('/login');
  }
  // --> If logged in, render urls/new.
  return res.render('urls_new', templateVars);

});
// ***


// ***** SHOW NEW TINY-URL PAGE W/ LINK *****
app.get('/urls/:id', (req, res) => {
  // --> Accessed by adding the short URL in place of ':id' in the browser.
  // --> Sends Status Code 404 if ID doesn't match any found in urlDB.

  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!urlDatabase[urlID]) {
    return res.status(404).send(`Status Code ${res.statusCode}: Short URL not found!`);
  }

  if (!userID) {
    return res.status(403).send(`Status Code ${res.statusCode}: Please sign in if you wish to view this page.`);
  }

  if (userID !== urlDatabase[urlID].userID) {
    return res.status(403).send(`Status Code ${res.statusCode}: These aren't the URL's you're looking for, move along.`);
  }

  const templateVars = {
    id: urlID,
    user: users[userID],
    longURL: urlDatabase[urlID].longURL,
  };

  return res.render('urls_show', templateVars);

});
// ***


// ***** REDIRECTING TO LONG URL *****
app.get('/u/:id', (req, res) => {
  const urlID = req.params.id;
  // const foundURL = fetchURLById(urlDatabase, urlID);

  // --> If url not found in database, return error message.
  if (!urlDatabase[urlID]) {
    return res.status(404).send(`Status Code ${res.statusCode}: Short URL doesn't yet exist!`);
  }

  //  --> Redirects user to the full webpage corresponding with the ID
  const longURL = urlDatabase[urlID].longURL;
  return res.redirect(longURL);
});
// ***


// ***** POST REQUEST TO CREATE NEW TINYURL *****
app.post('/urls', (req, res) => {

  const userID = req.session.user_id;

  if (!userID) {
    return res.send("Only registered users are allowed to create short URL's. Please sign up and try again.\n");
  }

  // --> Creating new random string, assigning it as key in urlDatabase w/ form input as value.
  const newShortURL = generateRandomString();

  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: userID
  };
  // --> Redirect to the urls_show page.
  return res.redirect(`/urls/${newShortURL}`);
});
// ***


// ***** EDIT FORM *****
app.post('/urls/:id', (req, res) => {

  const newLongURL = req.body.updatedURL;
  const urlID = req.params.id;
  const userID = req.session.user_id;

  // Return error message if: urlID doesn't exist, not logged in, or user doesn't own url.

  if (!urlDatabase[urlID]) {
    return res.status(404).send(`Status Code ${res.statusCode}: Short URL doesn't exist!`);
  }

  if (!userID || userID !== urlDatabase[urlID].userID) {
    return res.status(403).send(`Status Code ${res.statusCode}: Sorry, you are not authorized to do that!`);
  }

  // --> Finds key in urlDB using ID and changes the value to the input of the edit form.
  urlDatabase[urlID].longURL = newLongURL;
  return res.redirect('/urls');
});
// ***


// ***** DELETE BUTTONS *****
app.post('/urls/:id/delete', (req, res) => {
  //  --> Make helper function to execute deletion.
  //  --> Delete selected URL from urlDatabase, redirect to /urls page.
  const urlID = req.params.id;
  const userID = req.session.user_id;

  if (!urlDatabase[urlID]) {
    return res.status(404).send(`Status Code ${res.statusCode}: Short URL doesn't exist!`);
  }

  if (!userID || userID !== urlDatabase[urlID].userID) {
    return res.status(403).send(`Status Code ${res.statusCode}: Sorry, you are not authorized to do that!`);
  }

  deleteFromDB(urlDatabase, urlID);
  return res.redirect('/urls');
});
// ***


// ==============================================================================================================
//                                         SERVER LISTENER
// ==============================================================================================================


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


// ==============================================================================================================
//                                             THE END!
// ==============================================================================================================
