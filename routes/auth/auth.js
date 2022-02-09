const { Router } = require("express");
const router = Router();

const local_route = require('./local.route')
const facebook_route = require("./facebook.route");
const google_route = require("./google.route");
const twitter_route = require("./twitter.route");

router.use("/", local_route);
router.use("/facebook", facebook_route);
router.use("/google", google_route);
router.use("/twitter", twitter_route);
  
router.get("/logout", function (req, res) {
  res.clearCookie("jwt");   //unslash if using jwt
  console.log('logout')
  req.logout();
  res.redirect("/");
});

module.exports = router;
