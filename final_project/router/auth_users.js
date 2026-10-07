const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  if (!isValid(username)) {
    return false;
  }
  const user = users.find(user => user.username === username);
  return user.password === password;

}

//only registered users can login
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
  // Generate a JWT token
  const token = jwt.sign({ data: password }, "access", { expiresIn: "1h" });
  // Store the token in the session
  req.session.authorization = { accessToken: token, username: username };
  return res.status(200).json({ message: "User logged in successfully" });
  //res.send(`Session.authorization: ${JSON.stringify(req.session.authorization)}, Token: ${token}`);
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.session.authorization.username;
  books[isbn].reviews[username] = review;
  res.send(books[isbn].reviews);
  //res.send(`The review for the book with ISBN ${isbn} has been added/updated.`);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  delete books[isbn].reviews[username];
  res.send(`The review for the book with ISBN ${isbn} has been deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
