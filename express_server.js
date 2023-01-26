// ==============================================================================================================
//                                      INITIAL SERVER & MIDDLEWARE SETUP
// ==============================================================================================================
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { generateRandomString, deleteFromDB, fetchURLById, findUserByEmail } = require('./helperFunctions');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');



// --> Middleware code to parse the body for POST requests.
app.use(express.urlencoded({ extended: true }));

// Morgan middleware for logging to console.
app.use(morgan('dev'));

// --> Cookie Parser middleware
app.use(cookieParser());


// ==============================================================================================================
//                                        USER & URL DATABASES
// ==============================================================================================================


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
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
  res.redirect('/urls');
});
// ***

////////// REGISTER //////////////////////////////////////////////////////////////////////////////////////


// ***** REGISTRATION PAGE ***** 
app.get('/register', (req, res) => {

  // Assign value of user to appropriate object in userDB.
  const user = users[req.cookies['user_id']];

  const templateVars = {
    user
  };

  // --> If user is NOT already registered, render the register page. 
  if (!user) {
    res.render('register', templateVars);
  } else {
    // --> If user IS already registered, redirect to urls page.
    res.redirect('/urls');
  }
});
// ***


// ***** REGISTRATION FORM POST REQUEST *****
app.post('/register', (req, res) => {

  // --> Handles register post request to add new user to usersDB.

  const newUserID = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;
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
    password: newPassword,
  };

  res.cookie('user_id', newUserID);
  res.redirect('/urls');
});
// ***


////////// LOGIN ////////////////////////////////////////////////////////////////////////////////////////

// ***** LOGIN PAGE *****
app.get('/login', (req, res) => {

  // Assign value of user to appropriate object in userDB.
  const user = users[req.cookies['user_id']];

  const templateVars = {
    user
  };

  // --> If user is NOT already logged in, render login page. 
  if (!user) {
    res.render('login', templateVars);
  } else {
    // --> If user IS already logged in, redirect to urls.
    res.redirect('/urls');
  }

});

// ***


// ***** POST REQUEST FOR USER LOGIN *****
app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const foundUser = findUserByEmail(users, loginEmail);
  // --> Sets a cookie named user_id w/ value of name typed into the form input.


  // If there's no match for login email, respond w/ 403 status code
  if (!foundUser) {
    return res.status(403).send(`Status Code ${res.statusCode}: Email not yet registered!`);
  }

  // Email match? check password match also.
  // No password match? 403 status code and response.
  if (foundUser.password !== loginPassword) {
    return res.status(403).send(`Status Code ${res.statusCode}: Password is incorrect!`);
  } else {

    // email and password match? Set cookie to existing users ID and redirect.
    res.cookie('user_id', foundUser.id);
    res.redirect('/urls');
  }

});
// ***

// ***** POST REQUEST FOR LOGOUT BUTTON *****
app.post('/logout', (req, res) => {
  // --> Clears user_id cookie and redirects to urls page.
  res.clearCookie('user_id');
  res.redirect('/login');
});
// ***

////// URL PAGES /////////////////////////////////////////////////////////////////////////////////////////


// ***** MyURL'S PAGE *****
app.get('/urls', (req, res) => {
  // --> Get route for MyURLs tab, showing table of previoiusly created TinyURLS and corresponding long URLs 
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };

  res.render('urls_index', templateVars);
});

// ***

// ***** CREATE NEW URL/FORM PAGE *****
app.get('/urls/new', (req, res) => {
  //  --> Get route for the Create TinyURL page w/ form.
  const user = users[req.cookies['user_id']];

  const templateVars = {
    user
  };

  if (!user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});
// ***


// ***** SHOW NEW TINY-URL PAGE W/ LINK ***** 
app.get('/urls/:id', (req, res) => {
  // --> Accessed by adding the short URL in place of ':id' in the browser.
  // --> Sends Status Code 404 if ID doesn't match any found in urlDB.
  const urlID = req.params.id;
  const foundURL = fetchURLById(urlDatabase, urlID);

  if (!foundURL) {
    res.status(404).send(`Status Code ${res.statusCode}: Short URL not found!`);
  }

  const templateVars = {
    id: urlID,
    longURL: urlDatabase[urlID],
    user: users[req.cookies['user_id']]
  };

  res.render('urls_show', templateVars);

});
// ***


// ***** REDIRECTING TO LONG URL *****
app.get('/u/:id', (req, res) => {
  const urlID = req.params.id;
  const foundURL = fetchURLById(urlDatabase, urlID);

  if (!foundURL) {
    res.status(404).send(`Status Code ${res.statusCode}: Short URL doesn't yet exist!`);
  }

  //  --> Redirects user to the full webpage corresponding with the ID
  const longURL = urlDatabase[urlID];
  res.redirect(longURL);
});
// ***


// ***** POST REQUEST TO CREATE NEW TINYURL *****
app.post('/urls', (req, res) => {

  const user = users[req.cookies['user_id']];

  if (!user) {
    return res.send("Only registered users are allowed to create short URL's. Please sign up and try again.\n");
  }

  // --> POST request to 
  // --> Creating new random string, assigning it as key in urlDatabase w/ form input as value.
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  // --> Redirect to the urls_show page.
  res.redirect(`/urls/${newShortURL}`);
});
// ***


// ***** EDIT FORM *****
app.post('/urls/:id', (req, res) => {
  const newLongURL = req.body.updatedURL;
  const urlID = req.params.id;
  // --> Finds key in urlDB using ID and changes the value to the input of the edit form.
  urlDatabase[urlID] = newLongURL;
  res.redirect('/urls');
});
// ***


// ***** DELETE BUTTONS *****
app.post('/urls/:id/delete', (req, res) => {
  //  --> Make helper function to execute deletion.
  //  --> Delete selected URL from urlDatabase, redirect to /urls page.
  const urlID = req.params.id;

  deleteFromDB(urlDatabase, urlID);
  res.redirect('/urls');
});
// ***


// ==============================================================================================================
//                                         SERVER LISTENER
// ==============================================================================================================

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// ==============================================================================================================
//                                          EXAMPLE CODE
// ==============================================================================================================



// --> EXAMPLE CODE

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });