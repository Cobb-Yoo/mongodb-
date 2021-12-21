const express = require("express");
const app = express();

app.listen(8080, function () {
  console.log("hello node");
});

//app.get('경로', function(req, res))

app.get("/test2", (req, res) => {
  b.send("ㅋㅋㄹㅃㅃ");
});

app.get("/test", (reqa, res) => {
  b.send("ㅋㅋㄹㅃㅃ2");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
