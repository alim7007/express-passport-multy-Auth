const JWTStrategy = require('passport-jwt')

module.exports = (passport) =>{
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
 passport.use(
   new JWTStrategy.Strategy(
     {
       jwtFromRequest: (req) => {
         let token = null;
         if (req && req.cookies) {
           token = req.cookies.jwt;
         }
         return token;
       },
       secretOrKey: process.env.SESSION_SECRET,
     },
     (jwtPayload, done) => {
       if (!jwtPayload) {
         return done("No token found...");
       }
       console.log("jwtPayload");
       return done(null, jwtPayload.user);
     }
   )
 );

}

 