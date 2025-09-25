require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"); // needed to read form data
const dns = require("dns");
const urlParser = require("url");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// In-memory DB
let urlDatabase = {};
let counter = 1;

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  // Validate URL
  try {
    const parsedUrl = new URL(originalUrl);

    // Use DNS lookup to check validity
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      } else {
        const shortUrl = counter++;
        urlDatabase[shortUrl] = originalUrl;

        res.json({
          original_url: originalUrl,
          short_url: shortUrl,
        });
      }
    });
  } catch (e) {
    return res.json({ error: "invalid url" });
  }
});

// Redirect endpoint
app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  const originalUrl = urlDatabase[id];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
