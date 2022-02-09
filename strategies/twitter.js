const TwitterStrategy = require("passport-facebook").Strategy;
const User = require("../db/schemas/User");
const config = require('../config')

module.exports = function (passport) {
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

const twitterOptions = (user, profile, token, withID) => {
  if (withID) user.twitter.id = profile.id;
  user.twitter.token = token;
  user.twitter.username = profile.username;
  user.twitter.displayName = profile.displayName;
};
passport.use(
  new TwitterStrategy(
    config.twitter,
    async (req, token, refreshToken, profile, done) => {
      try {
        console.log("req.user:", req.user);
        if (!req.user) {
          const user = await userDB.findOne({ "twitter.id": profile.id });
          if (user) {
            //login with twitter
            if (!user.twitter.token) {
              //Relink after unlink with token
              await twitterOptions(user, profile, token, false);
              user.save();
              console.log("twitter login with relink token");
              return done(null, user);
            }
            console.log("twitter login");
            return done(null, user);
          }

          //Register with twitter
          const newUser = await new User();
          await twitterOptions(newUser, profile, token, true);
          newUser.local.name =
            profile.name.givenName + " " + profile.name.familyName;
          newUser.save();
          console.log("twitter sign-up");
          return done(null, newUser);
        } else {
          //Connect with twitter
          const user = await userDB.findOne({ "twitter.id": profile.id });
          const sessionUser = req.user;
          if (user) {
            if (!user.twitter.token) {
              //Relink after unlink with token
              await twitterOptions(sessionUser, profile, token, false);
            } else {
              throw new Error("This twitter user already exist");
            }
          }
          await twitterOptions(sessionUser, profile, token, true);
          sessionUser.save();
          console.log("twitter connection");
          return done(null, sessionUser);
        }
      } catch (e) {
        done(null, false, await req.flash("profileMessage", `${e.message}`));
      }
    }
  )
);
}
