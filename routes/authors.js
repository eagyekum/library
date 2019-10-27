const express = require("express");
const router = express.Router();
const Author = require("../models/Author");
const Book = require("../models/Book");

//Get all authors
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.status(200).render("authors", { authors, searchOptions: req.query });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//New Author Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Render Edit form for an Author
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author });
  } catch (err) {
    res.redirect("/authors");
  }
});

// Save Edit for an author
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    author.save();
    res.redirect(`/authors/${author._id}`);
  } catch (err) {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author,
        errorMessage: "Error Updating author"
      });
    }
  }
});

//Get single author
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: req.params.id });
    res.render("authors/show", { author, books });
  } catch (err) {
    console.log(err.message);
    res.redirect("/authors");
  }
});

//Delete an author
router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect(`/authors`);
  } catch (err) {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author._id}`);
    }
  }

  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    res.redirect("/authors");
  } catch (err) {
    res.json({ message: err.message });
  }
});

//Create Author
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name
  });

  try {
    const newAuthor = await author.save();
    res.status(201).redirect("authors");
  } catch (err) {
    res.status(400).render("authors/new", {
      author: author,
      errorMessage: "Error creating author"
    });
  }
});
module.exports = router;
