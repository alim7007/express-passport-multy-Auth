const { Router } = require("express");
const passport = require("passport");
const setJWT = require("../../controllers/set.jwt");
const { generateJwtToken } = require('../../utils/helpers')


const router = Router();

router.get(
  "/",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
  })
);

router.get(
  "/callback",
  passport.authenticate("facebook", {
    // successRedirect: "/profile", //slash if using jwt
    failureRedirect: "/profile",
    failureFlash: true,
  }),
  //unslash if using jwt
  setJWT
);

router.get(
  "/connect",
  passport.authorize("facebook", {
    scope: ["public_profile", "email"],
  })
);

router.get("/unlink", async (req, res) => {
  const user = req.user;
  user.facebook.token = undefined;
  //unslash if using jwt
  const token = await generateJwtToken(user);  
  await res.cookie("jwt", token);
  await user.save();
  if(user.local.email || user.twitter.token || user.google.token){
    res.redirect("/profile")
  }else{
    req.logout();
    res.redirect("/");
  }
});

module.exports = router;
