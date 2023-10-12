const express = require("express");
const app = express();
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "mysql-20063c0d-etudiant-5326.aivencloud.com",
    user: "user-formatif",
    password: "AVNS_L3yP0xCFyxAjhiqZ2hw",
    database: "defaultdb",
    port: 15397
});

con.connect(function (err) {
    if (err) { console.log(err); throw err };
    console.log("connected");
});

/*app.use((req, res) => {
    console.log("Message reçu");
    res.json({message: "Success"})
})*/

app.get('/getAllEvents', (req, res) => {
    const sqlRes = [];
    con.query("SELECT * FROM calendar_event", function (err, result, fields) {
        if (err) {
            throw err;
        } else {
            sqlRes = result;
            console.log(result);
        }
    });

    res.json({ reponseDB: sqlRes })
})

module.exports = app;