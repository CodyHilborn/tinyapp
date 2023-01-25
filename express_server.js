// ==============================================================================================================
//                                      INITIAL SERVER & MIDDLEWARE SETUP
// ==============================================================================================================
const express = require('express');
const cookieParser = require('cookie-parser');
const { generateRandomString, deleteURL, fetchURLbyId } = require('./helperFunctions');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');



// --> Middleware code to parse the body for POST requests.
app.use(express.urlencoded({ extended: true }));

// --> Cookie Parser middleware
app.use(cookieParser());


// ==============================================================================================================
//                                          URL DATABASE
// ==============================================================================================================


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};



// ==============================================================================================================
//                                     ROUTING & REQUEST HANDLERS
// ==============================================================================================================

// ***** HOME PAGE *****
app.get('/', (req, res) => {
  res.redirect('/urls');
});
// ***


// ***** MyURL'S PAGE *****
app.get('/urls', (req, res) => {
  // --> Get route for MyURLs tab, showing table of previoiusly created TinyURLS and corresponding long URLs 
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

// ***

// ***** CREATE NEW URL/FORM PAGE *****
app.get('/urls/new', (req, res) => {
  //  --> Get route for the Create TinyURL page w/ form.
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_new', templateVars);
});
// ***


// ***** SHOW NEW TINY-URL PAGE W/ LINK ***** 
app.get('/urls/:id', (req, res) => {
  // --> Accessed by adding the short URL in place of ':id' in the browser.
  // --> Sends Status Code 404 if ID doesn't match any found in urlDB.
  const ID = req.params.id;
  if (!fetchURLbyId(urlDatabase, ID)) {
    res.sendStatus(404);
  }
  const templateVars = {
    id: ID,
    longURL: urlDatabase[ID],
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
});
// ***

// ***** REDIRECTING TO LONG URL *****
app.get('/u/:id', (req, res) => {
  const ID = req.params.id;

  if (!fetchURLbyId(urlDatabase, ID)) {
    res.sendStatus(404);
  }

  //  --> Redirects user to the full webpage corresponding with the ID
  const longURL = urlDatabase[ID];
  res.redirect(longURL);
});
// ***



// ***** POST REQUEST FOR USER LOGIN (HEADER) *****
app.post('/login', (req, res) => {
  // --> Sets a cookie named username w/ value of name typed into the form input.
  console.log(req.body.username);
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});
// ***

// ***** POST REQUEST FOR LOGOUT BUTTON *****
app.post('/logout', (req, res) => {
  // --> Clears username cookie and redirects to urls page.
  res.clearCookie('username');
  res.redirect('/urls');
});
// ***

// ***** POST REQUEST TO CREATE NEW TINYURL *****
app.post('/urls', (req, res) => {
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
  const ID = req.params.id;
  // --> Finds key in urlDB using ID and changes the value to the input of the edit form.
  urlDatabase[ID] = newLongURL;
  res.redirect('/urls');
});
// ***

// ***** DELETE BUTTONS *****
app.post('/urls/:id/delete', (req, res) => {
  //  --> Make helper function to execute deletion.
  //  --> Delete selected URL from urlDatabase, redirect to /urls page.
  const ID = req.params.id;

  deleteURL(urlDatabase, ID);
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