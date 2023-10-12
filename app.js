const express = require("express");
const app = express();

app.use((req, res) => {
    console.log("Message reçu");
    res.json({message: "Success"})
})

module.exports = app;