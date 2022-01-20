if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
   
  // imports
  const express = require("express");
  const app = express();
  const bcrypt = require("bcrypt");
  const passport = require("passport");
  const flash = require("express-flash");
  const session = require("express-session");
  const methodOverride = require("method-override");
   
  // todo - add external db support
  const users = [];
   
  // configuring and initializing passport
  const initializePassport = require("./passport-config");
  initializePassport(
    passport,
    (email) => users.find((user) => user.email === email),
    (id) => users.find((user) => user.id === id)
  );
   
  app.set("view-engine", "ejs");
  app.use(express.urlencoded({ extended: false }));
  app.use(flash());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "8unto0n4oc7903zm",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(methodOverride("_method"));
   
  // routes
   
  // welcome page
  // display greetings message for the user and logout button
  app.get("/", checkAuthenticated, (req, res) => {
    res.render("index.ejs", { name: req.user.name });
  });
   
  // login page
  app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
  });
   
  app.post(
    "/login",
    checkNotAuthenticated,
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );
   
  // new user sign-up page
  app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register.ejs");
  });
   
  app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      users.push({
        id: "_" + Math.random().toString(36).slice(2),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
   
      res.redirect("/login");
    } catch (e) {
      // console.log(e);
      res.redirect("/redirect");
    }
   
    // check if the user is successfully added to array
    // console.log(users);
  });
   
  // logout of the application
  app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
  });
   
  // util methods
   
  // only authenticated user should enter index page
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/login");
    }
  }
   
  // unauthenticated user should not enter index page
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    next();
  }
   
  // start server
  const port = process.env.APPLICATION_PORT || 6001;
  app.listen(port, () => {
    console.log("Server listening at http://localhost:%s", port);
  });