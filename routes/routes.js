//Dependencies
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models");

module.exports = app => {
  //main page
  app.get("/", (req, res) => {
    db.Article.find({})
      .sort({ timestamp: -1 })
      .then(dbArticle => {
        if (dbArticle.length == 0) {
          //If no articles exist within the database render the index.handlebars
          res.render("index");
        } else {
          //If articles are found within the database, show saved articles
          res.redirect("/articles");
        }
      })
      .catch(err => {
        res.json(err);
      });
  });

  //saved article handlebar setup
  app.get("/saved", (req, res) => {
    db.Article.find({ saved: true })
      .then(dbArticle => {
        let articleObj = { article: dbArticle };
        //render the page with articles within the database
        res.render("saved", articleObj);
      })
      .catch(err => {
        res.json(err);
      });
  });

  //scrape the data then saves to mongodb
  app.get("/scrape", (req, res) => {
    //gets the body of the url
    axios
      .get("http://www.nytimes.com")
      .then(response => {
        //Set up $ to cheerio
        let $ = cheerio.load(response.data);

        $("h2").each(function(i, element) {
          let result = {};
          const title = $(this)
            .children(".item-info")
            .children(".title")
            .children("a")
            .text();
          const link = $(this)
            .children(".item-info")
            .children(".title")
            .children("a")
            .attr("href");
          const summary = $(this)
            .children(".item-info")
            .children(".teaser")
            .children("a")
            .text();

          result.title = title;
          result.link = link;
          result.summary = summary;

          //Creates a new Article
          db.Article.create(result)
            .then(dbArticle => {
              console.log("\nArticle scraped: ${dbArticle}");
            })
            .catch(err => {
              console.log("\nError while saving to database: ${err}");
            });
        });
        res.redirect("/articles");
      })
      .catch(error => {
        console.log("Error while getting data from url: ${error}");
      });
  });

  //show articles after scraping
  app.get("/articles", (req, res) => {
    db.Article.find({})
      .sort({ timestamp: -1 })
      .then(dbArticle => {
        let articleObj = { article: dbArticle };

        //render page with articles scraped
        res.render("index", articleObj);
      })
      .catch(err => {
        res.json(err);
      });
  });

  //Save article
  app.put("/article/:id", (req, res) => {
    let id = req.params.id;

    db.Article.findByIdAndUpdate(id, { $set: { saved: true } })
      .then(dbArticle => {
        res.json(dbArticle);
      })
      .catch(err => {
        res.json(err);
      });
  });

  //Remove article
  app.put("/saved/remove/:id", (req, res)=>{
    let id = req.params.id;

    db.Article.findByIdAndUpdate(id, { $set: { saved: false } })
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err=> {
      res.json(err);
    });
  });

  //Get current comments
  app.get("/article/:id", (req, res) => {
    let id = req.params.id;

    //Bug (only first comment is passed)
    db.Article.findById(id)
      .populate("comment")
      .then(dbArticle => {
        res.json(dbArticle);
      })
      .catch(err => {
        res.json(err);
      });
  });

  //Save new comment
  app.post("/comment/:id", (req, res) => {
    let id = req.params.id;

    db.Comment.create(req.body)
      .then(dbComment => {
        return db.Article.findOneAndUpdate(
          {
            _id: id
          },
          {
            $push: {
              comment: dbComment._id
            }
          },
          {
            new: true,
            upsert: true
          }
        );
      })
      .then(dbArticle => {
        res.json(dbArticle);
      })
      .catch(err => {
        res.json(err);
      });
  });

  //Delete Comment
  app.delete("/comment/:id", (req, res) => {
    let id = req.params.id;

    db.Comment.remove({ _id: id })
      .then(dbComment => {
        res.json({ message: "Comment Removed" });
      })
      .catch(err => {
        res.json(err);
      });
  });
};