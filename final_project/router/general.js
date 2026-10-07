const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Retrieve the in-memory catalog as a promise; an empty catalog rejects the request.
async function getBooks() {
  // Resolve with the catalog when it contains at least one book.
  return new Promise((resolve, reject) => {
    if (Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject("There are no books available.");
    }
  }).catch((err) => {
    // Log retrieval failures and rethrow so the endpoint can send its error response.
    console.error("Error retrieving books:", err);
    throw err;
  })
}

// POST /register: require username/password, reject duplicate usernames (400),
// and add the new account to the shared in-memory users list (201).
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

// GET /: await the complete catalog, or return 500 if retrieval fails.
public_users.get('/', async (req, res) => {
  try {
    const result = await getBooks();
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving books" });
  }
});


// GET /isbn/:isbn: return one book using its catalog key, or 404 if it is missing.
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    // Wrap the lookup in a promise so a missing book is handled by the catch block.
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


// GET /author/:author: return books with an exact, case-insensitive author match.
// Return 404 when no author matches the supplied URL parameter.
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const result = await new Promise((resolve, reject) => {
      // Compare normalized author names; the response contains book records without ISBN keys.
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


// GET /title/:title: return exact, case-insensitive title matches, including each ISBN.
// Return 404 when no title matches the supplied URL parameter.
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const result = await new Promise((resolve, reject) => {
      // Keep each catalog key alongside its book while filtering by normalized title.
      const filteredBooks = Object.entries(books).filter(([isbn, book]) => book.title.toLowerCase() === title.toLowerCase());
      if (filteredBooks.length > 0) {
        // Convert matching entries into response objects containing the ISBN and book details.
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

// GET /review/:isbn: return the book's reviews, keyed by username, or 404 if absent.
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
