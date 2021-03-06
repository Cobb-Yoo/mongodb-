const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
var db;

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.xcc2i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  function (err, client) {
    if (err) {
      return console.log(err);
    }
    // db연결
    db = client.db("todoapp");

    app.listen(8080, function () {
      console.log("http://localhost:8080");
    });
  }
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", function (req, res) {
  res.render("write.ejs");
  //res.sendFile(__dirname + "/views/write.html");
});

app.post("/add", function (req, res) {
  console.log(req.body);

  db.collection("counter").findOne({ name: "게시물갯수" }, function (err, res) {
    var totalPost = res.totalPost;

    db.collection("post").insertOne(
      { _id: totalPost + 1, title: req.body.title, date: req.body.date },
      function (err, res) {
        console.log("ok save");

        // {어떤 데이터를}, {이렇게 변경}
        // operaotr를 필수로 사용해야함
        db.collection("counter").updateOne(
          { name: "게시물갯수" },
          { $inc: { totalPost: 1 } }
        );
      }
    );
  });

  //db저장
  res.send("전송완료");
});

app.get("/list", function (req, res) {
  db.collection("post") // db선택
    .find()
    .toArray(function (err, result) {
      console.log(result);

      res.render("list.ejs", { posts: result });
    }); // 다 가져오기
});

app.delete("/delete", function (req, res) {
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, function (err, result) {
    res.status(200).send({ message: "성공했습니다." });
  });
});

app.get("/detail/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      console.log(result);
      res.render("detail.ejs", { data: result });
    }
  );
});

app.get("/edit/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      console.log(result);
      res.render("edit.ejs", { data: result });
    }
  );
});

app.put("/edit", function (req, res) {
  db.collection("post").updateOne(
    { _id: parseInt(req.body._id) },
    { $set: { title: req.body.title, date: req.body.date } },
    function (err, result) {
      console.log(result);
      res.redirect("/list");
    }
  );
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

//passport 미들웨어...
app.use(
  session({ secret: "금강선!!!", resvae: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", function (req, res) {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/fail" }),
  function (req, res) {
    console.log(req.body);
    res.redirect("/");
  }
);

app.get("/mypage", checkLogined, function (req, res) {
  console.log("hello");
  console.log(req.user);
  res.render("mypage.ejs", { user: req.user });
});

function checkLogined(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("not logined");
  }
}

//local strategy의 인증방식?
passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true, //세선정보를 저장할 것인가?
      passReqToCallback: false, //아이디/비번 외에 추가적인 검증이 필요할 때.
    },
    function (id, pw, done) {
      db.collection("login").findOne({ id: id }, function (err, res) {
        if (err) return done(err);

        if (!res) return done(null, false, { message: "존재하지않는 아이디" });
        if (pw == res.pw) {
          return done(null, res);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

//id를 이용해서 세션을 저장시키는 코드(로그인 성공시 발동)
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//아 새숀 데이터를 가진 사람을 DB에서 찾아주세요 (마이페이지 접속시 발동)
passport.deserializeUser(function (id, done) {
  //db에서 user.id로 유저를 찾은 뒤에 유저 정보를 아래에 넣음...
  db.collection("login").findOne({ id: id }, function (err, res) {
    done(null, res);
  });
});

app.post("/register", function (req, res) {
  console.log(req.body.id);
  db.collection("login").insertOne(
    { id: req.body.id, pw: req.body.pw },
    function (err, result) {
      res.redirect("/");
    }
  );
});

app.get("/search", (req, res) => {
  var option = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: req.query.value,
          path: "title", // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        },
      },
    },
  ];

  db.collection("post")
    .aggregate(option)
    // .find({ $text: { $search: req.query.value } })
    .toArray((에러, result) => {
      console.log(result);
      res.render("list.ejs", { posts: result });
    });
});
