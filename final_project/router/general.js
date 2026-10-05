const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(books[isbn]){
    res.send(books[isbn]);
  } else {
    res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
  if(filteredBooks.length > 0){
    res.send(filteredBooks);
  } else {
    res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
  if(filteredBooks.length > 0){
    res.send(filteredBooks);
  } else {
    res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
