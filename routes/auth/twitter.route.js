const { Router } = require("express");
const passport = require('passport')

const router = Router()

router.get(
  "/",
  passport.authenticate("twitter", { scope: "email" })
);

router.get(
  "/callback",
  passport.authenticate("twitter", {
    successRedirect: "/profile",
    // failureRedirect: "/",
  })
);

router.get(
  "/connect",
  passport.authorize("twitter", { scope: "email" })
);

router.get(
  "/connect/callback",
  passport.authorize("twitter", {
    successRedirect: "/profile",
    // failureRedirect: "/",
  })
);

router.get("/unlink", (req, res) => {
  const user = req.user;
  user.twitter.token = undefined;
  user.save();
  if(user.facebook.token || user.local.email || user.google.token){
    res.redirect("/profile")
  }else{
    req.logout();
    res.redirect("/");
  }
});

module.exports = router
