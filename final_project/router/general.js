const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

async function getBooks() {
  return new Promise((resolve, reject) => {
    if (Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject("There are no books available.");
    }
  }).catch((err) => {
    console.error("Error retrieving books:", err);
    throw err;
  })
}

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const result = await getBooks();
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving books" });
  }
});


//Get book details based on ISBN async
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const result = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });
    res.send(result);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});


// Get book details based on author async
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const result = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found by this author");
      }
    });
    res.send(result);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});


public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const result = await new Promise((resolve, reject) => {
      const filteredBooks = Object.entries(books).filter(([isbn, book]) => book.title.toLowerCase() === title.toLowerCase());
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
        resolve(filteredBooks.map(([isbn, book]) => ({ isbn, ...book })));
      } else {
        reject("No books found with this title");
      }
    });
    res.send(result);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
