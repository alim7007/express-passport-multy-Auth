const { Router } = require("express");
const passport = require('passport');
const {generateJwtToken} = require("../../utils/helpers");

const User = require("../../db/schemas/User");
const setJWT = require("../../controllers/set.jwt");

const router = Router()

router.get("/login", (req, res) => {
  res.render("login.ejs", { message: req.flash("loginMessage") });
});
router.get("/signup", (req, res) => {
  res.render("signup.ejs", { message: req.flash("signupMessage") });
});
router.get("/connect/local", (req, res) => {
  res.render("connect-local.ejs", { message: req.flash("loginMessage") });
});


router.post(
  "/login",
  passport.authenticate("local-login", {
    // successRedirect: "/profile", // slash if using jwt
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  // unslash if using jwt
  setJWT
);

router.post(
  "/signup",
  passport.authenticate("local-signup", {
    // successRedirect: "/profile",  // slash if using jwt
    failureRedirect: "/auth/signup",
    failureFlash: true,
  }),
  // unslash if using jwt
  setJWT
);

router.post(
  "/connect/local",
  passport.authenticate("local-signup", {
    // successRedirect: "/profile",
    failureRedirect: "/auth/connect/local",
    failureFlash: true,
  }),
  setJWT
);

router.get("/delete/local", async function (req, res) {
  await User.findByIdAndRemove(req.user._id);
  await req.logout();
  res.clearCookie('jwt');
  res.redirect("/api_doesnt_invoke_passport_deserialize");
});

module.exports = router

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.send(400);
//   const userDB = await User.findOne({ email });
//   if (!userDB) return res.send(401);
//   const isValid = comparePassword(password, userDB.password);
//   if (isValid) {
//     console.log('Authenticated Successfully!');
//     req.session.user = userDB;
//     return res.send(200);
//   } else {
//     console.log('Failed to Authenticate');
//     return res.send(401);
//   }
// });


// router.post("/signup", async (req, res) => {
//   const { email } = req.body;
//   const userDB = await User.findOne({ email });
//   if (userDB) {
//     res.status(400).send({ msg: "User already exists!" });
//   } else {
//     const password = hashPassword(req.body.password);
//     console.log(password);
//     await User.create({ email, password });
//     res.send(201);
//   }
// });