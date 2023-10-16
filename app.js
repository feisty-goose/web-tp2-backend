const express = require("express");
const app = express();
var mysql = require("mysql");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var con = mysql.createConnection({
  host: "mysql-20063c0d-etudiant-5326.aivencloud.com",
  user: "user-formatif",
  password: "AVNS_L3yP0xCFyxAjhiqZ2hw",
  database: "defaultdb",
  port: 15397,
});

// TODO: Implement hashing and salting algorithm
function hashAndSalt(rawTextPassword) {
  return rawTextPassword;
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

module.exports = app;
