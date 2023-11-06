const express = require("express");
const app = express();
var mysql = require("mysql");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(
  session({
    // initialise la session
    key: "userId", // nom du cookie
    secret: "subscribe", // utilisé pour hasché l'id de session
    resave: true, // a vous de trouver l'utilité
    saveUninitialized: false, //a vous de trouver l'utilité
    cookie: {
      //
      expires: 60 * 60 * 24, // 24 heures
    },
  })
);

var con = mysql.createConnection({
  host: "mysql-20063c0d-etudiant-5326.aivencloud.com",
  user: "user-formatif",
  password: "AVNS_L3yP0xCFyxAjhiqZ2hw",
  database: "defaultdb",
  port: 15397,
});

function hashAndSalt(rawTextPassword) {
  bcrypt.hash(rawTextPassword, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    return hash;
  });

  return undefined;
}

con.connect(function (err) {
  if (err) {
    console.log(err);
    throw err;
  }
  console.log("connected");
});

app.get("/getAllEvents", (req, res) => {
  con.query("SELECT * FROM events", function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      res.json({ response: result });
    }
  });
});

app.delete("/deleteEvent", (req, res) => {
  console.log(req.body);
  let id = req.body.id;

  if (id === undefined) return;

  con.query("DELETE FROM events WHERE id = ?;", [id], function (err, result) {
    if (err) throw err;
  });
});

app.post("/addEvent", (req, res) => {
  console.log(req.body);
  let name = req.body.name;
  let date = req.body.date;
  let userId = req.body.userId;

  if (name === undefined) return;
  if (date === undefined) return;
  if (userId === undefined) return;

  con.query(
    "INSERT INTO events (name, date, user_Id) VALUES ( ?, ?, ? );",
    [name, date, userId],
    function (err, result, fields) {
      if (!err) {
        result = result.affectedRows > 0 ? "Success" : "Failure";
        res.json({ response: result });
      } else {
        throw err;
      }
    }
  );
});

app.get("/getAllUsers", (req, res) => {
  con.query("SELECT * FROM users", function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      res.json({ response: result });
    }
  });
});

app.post("/signUp", (req, res) => {
  console.log(req.body); // ?
  let name = req.body.name;
  let password = req.body.rawPassword;

  if (name === undefined) return;
  if (password === undefined) return;

  password = hashAndSalt(password);

  con.query(
    "INSERT INTO users (name, password) VALUES ( ?, ? );",
    [name, password],
    function (err, result, fields) {
      if (!err) {
        result = result.affectedRows > 0 ? "Success" : "Failure";
        res.json({ response: result });
      } else if (err.code === "ER_DUP_ENTRY") {
        res.json({ response: "User already exists" });
      } else {
        throw err;
      }
    }
  );
});

app.get("/logIn", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/logIn", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  con.query(
    "SELECT * FROM users WHERE name = ?;",
    [username],
    function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.json({ response: result });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (err, response) => {
          if (response) {
            req.session.user = result;
            res.send(result);
          } else {
            res.send({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
});

module.exports = app;
