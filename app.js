const express = require("express");
const app = express();
var mysql = require("mysql");

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

module.exports = app;
