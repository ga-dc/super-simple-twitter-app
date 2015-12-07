var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;
var env = require("./env");

app.set("view engine", "hbs");

app.use(cookieParser());
app.use(session({
  secret: env.sessionSecret,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
});

passport.serializeUser(function(user, next) {
  next(null, user);
});
passport.deserializeUser(function(user, next) {
  next(null, user);
});
passport.use(new Strategy(
  env.twitter,
  function(token, tokenSecret, profile, next){
    next(null, profile);
  }
));

app.get("/", function(req, res){
  res.render("index");
});

app.get("/cat", function(req, res){
  res.render("show");
});

app.get("/signin", passport.authenticate("twitter"));

app.get("/signout", function(req, res){
  req.session.destroy();
  res.locals.user = null
  res.render("signout");
});

app.get("/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/signout" }),
  function(req, res){
    res.redirect("/");
  });

app.listen(3000, function(){
  console.log("* I'm working! Go to http://127.0.0.1:3000");
});
