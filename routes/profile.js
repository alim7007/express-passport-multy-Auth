var express = require('express');
const { isLoggedIn } = require('../middleware');
var router = express.Router();
const passport = require('passport')

  // router.get("/", isLoggedIn, function (req, res) {
  //   res.render("profile", {
  //     user: req.user,
  //     message:req.flash('profileMessage')
  //   });
  // });

router.get("/", passport.authenticate("jwt", { session: false, failureRedirect: "/" }), (req, res) => {
  console.log("middleware:",req.user)
    res.render("profile", {
      user: req.user, 
      message:req.flash('profileMessage')
    });
  });

module.exports = router;
