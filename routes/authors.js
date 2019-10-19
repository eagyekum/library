const express = require("express");
const router = express.Router();
const Author = require("../models/Author");

//Get all authors
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res
      .status(200)
      .render("authors/index", { authors, searchOptions: req.query });
  } catch (err) {
    res.status(500).redirect("/", { errorMessage: err.message });
  }
  //res.render("authors/index");
});

//New Author Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
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
