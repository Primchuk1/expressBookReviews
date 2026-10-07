const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Shared account storage; registrations are lost when the server restarts.
let users = [];

// Check whether an account already exists using an exact username match.
const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Validate credentials against the registered account; unknown usernames return false.
const authenticatedUser = (username, password) => {
  if (!isValid(username)) {
    return false;
  }
  const user = users.find(user => user.username === username);
  return user.password === password;

}

// POST /customer/login: require credentials (400), validate the password (401 on failure),
// then save a one-hour JWT and username in the session for protected review routes.
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: "Username does not exist" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  // Sign the current password payload with the same secret used by authentication middleware.
  const token = jwt.sign({ data: password }, "access", { expiresIn: "1h" });
  // Store the token for verification and the username for identifying the user's review.
  req.session.authorization = { accessToken: token, username: username };
  return res.status(200).json({ message: "User logged in successfully" });
  //res.send(`Session.authorization: ${JSON.stringify(req.session.authorization)}, Token: ${token}`);
});

// PUT /customer/auth/review/:isbn: add or replace the logged-in user's review from req.body.review.
// Authentication middleware runs first; this handler assumes the ISBN exists and returns all reviews.
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.session.authorization.username;
  books[isbn].reviews[username] = review;
  res.send(books[isbn].reviews);
  //res.send(`The review for the book with ISBN ${isbn} has been added/updated.`);
});

// DELETE /customer/auth/review/:isbn: remove only the logged-in user's review and confirm deletion.
// Authentication middleware runs first; this handler assumes the ISBN exists.
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  delete books[isbn].reviews[username];
  res.send(`The review for the book with ISBN ${isbn} has been deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
