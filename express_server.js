// --> INITIAL SERVER SETUP CODE.
const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

// --> Code to parse the body for POST requests.
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const generateRandomString = function() {
  //--> Generates a random string of 6 alpha-numeric characters.
  return Math.random().toString(36).slice(2, 8);
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  // --> Get route for MyURLs tab, showing table of previoiusly created TinyURLS and corresponding long URLs 
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  // console.log(req.body);
  // --> Creating new random string, assigning it as key in urlDatabase w/ form input as value.
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.send();
});

app.get('/urls/new', (req, res) => {
  //  --> Get route for the Create TinyURL page w/ form.
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  // --> Accessed by adding the short URL in place of ':id' in the browser.
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});



// --> Server listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// --> EXAMPLE CODE

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });