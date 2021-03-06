const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Author = require("../models/Author");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const uploadPath = path.join("public", Book.coverImageBasePath);
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  }
});

//Get all books
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title) {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore) {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter) {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books,
      searchOptions: req.query
    });
  } catch (err) {
    res.redirect("/");
  }
});

//New Book Route
router.get("/new", async (req, res) => {
  const book = new Book();
  renderNewEditPage(res, book, "books/new");
});

//Create Book
router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const { title, description, pageCount, author } = req.body;

  const book = new Book({
    title,
    description,
    publishDate: new Date(req.body.publishDate),
    pageCount,
    author,
    coverImageName: fileName
  });

  //console.log(book);
  try {
    const newBook = await book.save();
    // console.log(newBook);
    res.redirect("books");
  } catch (err) {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    //removeBookCover();
    renderNewEditPage(res, book, "books/new", true);
  }
});

//Render single show book page
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.render("books/show", { book });
  } catch (err) {
    res.redirect("/books");
  }
});

//Render edit page for boot
router.get("/:id/edit", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
  } catch (err) {
    res.redirect("/books");
  }
  renderNewEditPage(res, book, "books/edit");
});

// Update book

router.put("/:id", upload.single("cover"), async (req, res) => {
  //console.log("putting");
  const fileName = req.file != null ? req.file.filename : null;
  const { title, description, pageCount, author } = req.body;
  let book;
  try {
    book = await Book.findById(req.params.id);

    book.title = title;
    book.description = description;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = pageCount;
    book.author = author;
    book.coverImageName = fileName;
    await book.save();
    res.redirect("/books");
  } catch (err) {
    if ((book = "null")) res.redirect("/books");
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    //removeBookCover();
    renderNewEditPage(res, book, "books/edit", true);
  }
});

// Delete a book
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect(`/books`);
  } catch (err) {
    if (book == null) {
      res.redirect("/");
    } else {
      res.redirect(`/books/${book.id}`);
    }
  }
});

async function renderNewEditPage(res, book, url, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { authors, book };

    if (hasError) {
      if (url == "books/new") params.errorMessage = "Error Creating Book";
      else if (url == "books/edit") params.errorMessage = "Error Updating Book";
    }
    res.render(url, params);
  } catch (err) {
    res.redirect("/books");
  }
}

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err);
  });
}
module.exports = router;
