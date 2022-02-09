const { Router } = require("express");
const passport = require("passport");
const { generateJwtToken }= require("../../utils/helpers");
const setJWT = require("../../controllers/set.jwt");
const router = Router();

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    // successRedirect: "/profile", // slash if using jwt
    failureRedirect: "/profile",
    failureFlash: true,
  }),
  // unslash if using jwt
  setJWT
);

router.get(
  "/connect",
  passport.authorize("google", { scope: ["profile", "email"] })
);

router.get("/unlink", async (req, res) => {
  const user = req.user;
  user.google.token = undefined;
  //unslash if using jwt
  const token = await generateJwtToken(user);
  await res.cookie("jwt", token);
  await user.save();
  if (user.facebook.token || user.twitter.token || user.local.email) {
    res.redirect("/profile");
  } else {
    req.logout();
    res.redirect("/");
  }
});

module.exports = router;
