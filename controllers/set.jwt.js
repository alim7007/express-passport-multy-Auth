const {generateJwtToken} = require('../utils/helpers')

const setJWT = async (req, res) => {
  const token = await generateJwtToken(req.user);
  res.cookie("jwt", token);
  res.redirect("/profile");
};

module.exports = setJWT
