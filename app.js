var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;
var env = require("./env");

app.set("view engine", "hbs");

console.log("* Restarting! This means all session data is erased.");

app.use(function(req, res, next){
  console.log("------");
  console.log(req.headers.host + req.url);
  next();
});

var cookieParserFunction = cookieParser();
app.use(function(req, res, next){
  console.log("* Getting the session ID from cookies...");
  cookieParserFunction(req, res, next);
});

var sessionFunction = session({
  secret: env.sessionSecret,
  resave: true,
  saveUninitialized: true
});
app.use(function(req, res, next){
  console.log("* The session ID is " + req.cookies["connect.sid"] + ". 'Hashing' it...")
  sessionFunction(req, res, next);
});

var passportInitializer = passport.initialize();
app.use(function(req, res, next){
  console.log("* The session hash is " + req.sessionID + "...");
  console.log("* Initializing Passport...");
  passportInitializer(req, res, next);
});

var passportSessionFunction = passport.session();
app.use(function(req, res, next){
  console.log("* Setting Passport's own session variables...");
  passportSessionFunction(req, res, next);
});

app.use(function(req, res, next){
  if(req.user){
    console.log("* Making " + req.user.username + "'s deserialized user data available in .hbs views...");
  }else{
    console.log("* Skipping a step because there's no current user...")
  }
  res.locals.user = req.user;
  next();
});

passport.serializeUser(function(user, next) {
  console.log("* Serializing: Saving " + user.username + "'s data as a session variable...");
  next(null, user);
});

passport.deserializeUser(function(user, next) {
  console.log("* Deserializing: Getting " + user.username + "'s data from session variables...");
  next(null, user);
});

var twitterStrategy = new Strategy(
  env.twitter,
  function(token, tokenSecret, profile, next){
    console.log("* Got " + profile.username + "'s info using the Twitter 'Strategy'. Sending it to be serialized...");
    next(null, profile);
  }
);
passport.use(twitterStrategy);

// Moving on to the routes...

app.get("/", function(req, res){
  console.log("* Rendering the index...");
  res.render("index");
});

app.get("/cat", function(req, res){
  console.log("* Rendering a cat picture...");
  res.render("show");
});

var twitterAuthenticator = passport.authenticate("twitter");
app.get("/signin", function(req, res){
  console.log("* Signing in: Redirecting to Twitter...");
  twitterAuthenticator(req, res);
});

app.get("/signout", function(req, res){
  var username;
  if(req.user) username = req.user.username;
  else username = "user";
  console.log("* Signing out: Deleting " + username + "'s session variables and making sure their info isn't being saved in memory anywhere...");
  req.session.destroy();
  res.locals.user = null
  res.render("signout");
});

var authenticateNewUser = passport.authenticate("twitter", { failureRedirect: "/signout" });
app.get("/auth/twitter/callback",
  function(req, res, next){
    console.log("* Authenticating: Using the OAuth tokens Twitter sent back to get the user's Twitter profile information...")
    authenticateNewUser(req, res, next);
  },
  function(req, res){
    console.log("* Redirecting to the main page...");
    res.redirect("/");
  });

app.listen(3000, function(){
  console.log("* I'm working! Go to http://127.0.0.1:3000");
});
