const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require("../db/schemas/User");
const { v4: uuidv4 } = require("uuid");
const config = require("../config")

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

  const googleOptions = (user, profile, token, withID, withLocal) =>{
    if(withID) user.google.id = profile.id;
    user.google.token = token;
    user.google.name = profile.displayName;
    user.google.email = profile.emails[0].value;
    if(withLocal){
      //Add email and name to local after register with google
      user.local.email = profile.emails[0].value;
      user.local.name = profile.displayName;
      user.local.password = user.generateHash(uuidv4());
    }
  }

  passport.use(
    new GoogleStrategy(config.google,
      async (req, token, refreshToken, profile, done) => {
        try {
          if (!req.user) {
            //login with google
            const user = await User.findOne({ "google.id": profile.id });
            if (user) {
              if (!user.google.token) {
                //Relink after unlink with token
                await googleOptions(user, profile, token, false);
                user.save();
                console.log("Google login with relink token");
                return done(null, user);
              }
              console.log("Google login");
              return done(null, user);
            }
            //Register with google
            const newUser = await new User();
            await googleOptions(newUser, profile, token, true, true);
            newUser.save();
            console.log("Google sign-up");
            return done(null, newUser);
          } else {
            //Connect with google
            const user = await User.findOne({ "google.id": profile.id });
            const sessionUser = req.user;
            if (user) {
              if (!user.google.token) {
                //Relink after unlink with token
                await googleOptions(sessionUser, profile, token, false);
              } else {
                throw new Error("This google user already exist");
              }
            }
            await googleOptions(sessionUser, profile, token, true);
            //Chnage email if email exist but was not connected with google
            if (sessionUser?.local?.email) {
              sessionUser.local.email = profile.emails[0].value;
            }
            if (!sessionUser?.local?.email) {
              sessionUser.local.email = profile.emails[0].value;
              sessionUser.local.password = sessionUser.generateHash(uuidv4());
            }
            sessionUser.save();
            console.log("Google connection");
            return done(null, sessionUser);
          }
        } catch (e) {
          done(null, false, await req.flash("profileMessage", `${e.message}`));
        }
      }
    )
  );
    
}
