const FaceBookStrategy = require("passport-facebook").Strategy;
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

  const facebookOptions = (user, profile, token, withID) => {
    if(withID) user.facebook.id = profile.id;
    user.facebook.token = token;
    user.facebook.name = profile.name.givenName + " " + profile.name.familyName;
    user.facebook.email = profile.emails[0].value;
  }

  passport.use(
    new FaceBookStrategy( config.facebook,
      async (req, token, refreshToken, profile, done) => {
        try {
          if(!req.user){
            const user = await User.findOne({ "facebook.id": profile.id });
            if (user) {
              //login with Facebook
              if (!user.facebook.token) {
                //Relink after unlink with token
                await facebookOptions(user, profile, token, false);
                user.save();
                console.log("Facebook login with relink token");
                return done(null, user);
              }
              console.log("Facebook login");
              return done(null, user);
            }
            
            //Register with Facebook
            const newUser = await new User();
            await facebookOptions(newUser, profile, token, true);
            newUser.local.name = profile.name.givenName + " " + profile.name.familyName;
            newUser.save();
            console.log("Facebook sign-up");
            return done(null, newUser);
          }else{
            //Connect with Facebook
            const user = await User.findOne({ "facebook.id": profile.id });
            const sessionUser = req.user
            if(user){
              if (!user.facebook.token) {
                //Relink after unlink with token
                await facebookOptions(sessionUser, profile, token, false);
              }else{ 
                throw new Error("This facebook user already exist")
              }
            }
            await facebookOptions(sessionUser, profile, token, true);
            sessionUser.save();
            console.log("Facebook connection");
            return done(null, sessionUser);
          }
        } catch (e) {
          done(null, false, await req.flash("profileMessage", `${e.message}`));
        }
      }
    )
  );
    
}
