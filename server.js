const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
var db;

MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.xcc2i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  function (err, client) {
    if (err) {
      return console.log(err);
    }
    // db연결
    db = client.db("todoapp");

    app.listen(8080, function () {
      console.log("listening on 8080");
    });
  }
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", function (req, res) {
  res.sendFile(__dirname + "/write.html");
});

app.post("/add", function (req, res) {
  console.log(req.body);

  //db저장
  db.collection("post").insertOne(
    { title: req.body.title, weather: req.body.weather },

    function (err, res) {
      console.log("ok save");
    }
  );
  res.send("전송완료");
});
