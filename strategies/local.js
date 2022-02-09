const LocalStrategy  = require("passport-local").Strategy;
const User = require("../db/schemas/User");
const config = require('../config')

  module.exports = function(passport) {
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
      console.log("deserialize called");
      try {
        const user = await User.findById(id);
        if (!user) throw new Error("user not found");
        done(false, user);
      } catch (e) {
        done(e, null);
      }
    });

  const localOptions = (user, email, password, req) => {
    user.local.email = email;
    user.local.name = req.body.name;
    user.local.password = user.generateHash(password);
  }

    //PASSPORT REGISTER
    passport.use(
      "local-signup",
      new LocalStrategy(config.local, async (req, email, password, done) => {
        try {
          console.log('req.user:',req.user)
          const user = await User.findOne({ "local.email": email });
          if (user) throw new Error("User already exists");
          if (req.user) {
            //Local Connection
            const sessionUser = req.user;
            await localOptions(sessionUser, email, password, req)
            sessionUser.save();
            console.log("Local connection");
            return done(null, sessionUser);
          }
          //Local Sign-up
          const newUser = await new User();
          await localOptions(newUser, email, password, req);
          newUser.save();
          console.log("Local sign-up");
          return done(null, newUser);
        } catch (e) {
          return done(
            null,
            false,
            await req.flash("signupMessage", `${e.message}`)
          );
        }
      })
    );

    //PASSPORT LOGIN
    passport.use(
      "local-login",
      new LocalStrategy(config.local, async (req, email, password, done) => {
        try {
          if (!email || !password) throw new Error("Mising credentials");
          const user = await User.findOne({ "local.email": email });
          if (!user) throw new Error("No user with this email");
          if (!user.validPassword(password))
            throw new Error("incorrect password");
          console.log("Local login");
          return done(null, user);
        } catch (e) {
          return done(
            null,
            false,
            await req.flash("loginMessage", `${e.message}`)
          );
        }
      })
    );
  }

