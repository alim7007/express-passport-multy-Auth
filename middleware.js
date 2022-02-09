function isLoggedIn(req, res, next) {
  console.log("middleware", req.user);
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = {
  isLoggedIn,
};