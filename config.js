const config = {
  local:{
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  facebook: {
    clientID: process.env.CLIENT_ID_FB,
    clientSecret: process.env.CLIENT_SECRET_FB,
    callbackURL: process.env.CLIENT_URLCALLBACK_FB,
    profileFields: ["id", "name", "email"],
    passReqToCallback: true,
  },
  google: {
    clientID: process.env.CLIENT_ID_GOOGLE,
    clientSecret: process.env.CLIENT_SECRET_GOOGLE,
    callbackURL: process.env.CLIENT_URLCALLBACK_GOOGLE,
    profileFields: ["id", "name", "email"],
    passReqToCallback: true,
  },
  twitter: {
    consumerKey: process.env.CONSUMER__KEY_TWITTER,
    consumerSecret: process.env.CONSUMER_SECRET_TWITTER,
    callbackURL: process.env.CLIENT_URLCALLBACK_TWITTER,
    profileFields: ["id", "name", "email"],
    passReqToCallback: true,
  }
};

module.exports = config