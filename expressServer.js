//Import express module
const express = require("express");
//create an instance of the express application
const app = express();
const path = require("path");
const PORT = 3000;
const cors = require("cors");
const { logger } = require("./middleware/logger.js");
const errorHandler = require("./middleware/errorHandler.js");

//Built in middlerware functions
app.use(express.urlencoded({ extended: false }));
app.use("/assets", express.static(path.join(__dirname, "/assets")));
app.use("/data", express.static(path.join(__dirname, "data")));
app.use(express.json());

//Custom middlerware function
app.use(logger);

const whiteList = [
  "http://127.0.0.1:550",
  "http://localhost:3000",
  "https://www.google.com/",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionScuccessStatus: 200,
};

//Cross-origin resource sharing
app.use(cors(corsOptions));

app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/about.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

app.get("/user/:userID/book/:bookID", (req, res) => {
  const { userID, bookID } = req.params;
  res.send(`user ID: ${userID}, book ID: ${bookID}`);
});

app.get("/user/{:id}", (req, res) => {
  const userId = req.params.id || "No ID Provided";
  res.send(`User ID: ${userId}`);
});

app.get("/old-page", (req, res) => {
  res.redirect(301, "/new-page");
});

app.get("/new-page", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "new-page.html"));
});

app.get(
  "/multi",
  (req, res, next) => {
    console.log("first Handler executed");
    req.data = "Data from first handler";
    next();
  },
  (req, res, next) => {
    console.log("second Handler executed");
    req.data = "Data from second handler";
    next();
  },
  (req, res) => {
    console.log("third Handler executed");
    res.send(`final response ${req.data}`);
  },
);

app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "404.html"));
});

//Custom error middleware function

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
