const express = require("express");
const app = express();
var mysql = require("mysql");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(
  session({
    // initialise la session
    key: "userId", // nom du cookie
    secret: "subscribe", // utilisé pour hasché l'id de session
    resave: false, // a vous de trouver l'utilité
    saveUninitialized: false, //a vous de trouver l'utilité
    cookie: {
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

con.connect(function (err) {
  if (err) {
    console.log(err);
    throw err;
  }
  console.log("connected");
});

app.get("/getStats", (req, res) => {
  let stats = [0, 0];

  con.query("SELECT COUNT(1) FROM users", function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      stats = [result[0]["COUNT(1)"], 0];
    }
  });

  con.query("SELECT COUNT(1) FROM events", function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      stats = [stats[0], result[0]["COUNT(1)"]];
      res.json(stats);
    }
  });
});

app.get("/getAllEvents", (req, res) => {
  const userId = req.query.userId;

  if (userId === "") return;

  con.query(
    "SELECT * FROM events WHERE user_id = ?;",
    [userId],
    function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    }
  );
});

app.delete("/deleteEvent", (req, res) => {
  let id = req.body.id;

  console.log(id);
  if (id === undefined) return;

  con.query("DELETE FROM events WHERE id = ?;", [id], function (err, result) {
    if (err) {
      throw err;
    } else {
      result = result.affectedRows > 0 ? "Success" : "Failure";
      res.json({ response: result });
    }
  });
});

app.post("/addEvent", async (req, res) => {
  let name = req.body.name;
  let date = req.body.date;
  let userId = req.body.userId;

  if (name === undefined) return;
  if (date === undefined) return;
  if (userId === undefined) return;

  con.query(
    "INSERT INTO events (name, date, user_id) VALUES ( ?, ?, ? );",
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

app.post("/signUp", async (req, res) => {
  let username = req.body.username;
  let password = req.body.rawPassword;

  if (username === undefined) {
    res.json({ errMessage: "Invalid username" });
    return;
  }
  if (password === undefined) {
    res.json({ errMessage: "Invalid password" });
    return;
  }

  let salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  con.query(
    "INSERT INTO users (name, password) VALUES ( ?, ? );",
    [username, password],
    function (err, result, fields) {
      if (!err) {
        result = result.affectedRows > 0 ? "Success" : "Failure";
        res.json({ response: result });
      } else if (err.code === "ER_DUP_ENTRY") {
        res.json({ errMessage: "User already exists" });
      } else {
        throw err;
      }
    }
  );
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/logIn", (req, res) => {
  const username = req.body.username;
  const password = req.body.rawPassword;

  con.query(
    "SELECT * FROM users WHERE name = ?;",
    [username],
    function (err, result, fields) {
      if (err) {
        throw err;
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (err, compareResult) => {
          if (err) {
            console.log("err", err);
            return;
          }
          if (compareResult) {
            console.log(req.session);
            req.session.user = result;
            console.log("result", result);
            res.send({ id: result[0].id, name: result[0].name });
          } else {
            res.send({ message: "Wrong username/password combination" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.sendStatus(500);
    } else {
      res.clearCookie("userId");
      res.sendStatus(200);
    }
  });
});

module.exports = app;
