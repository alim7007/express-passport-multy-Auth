const bcrypt = require("bcrypt-nodejs");
const jwt = require('jsonwebtoken')

function hashPassword(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

function comparePassword(raw, hash) {
  return bcrypt.compareSync(raw, hash);
}

const generateJwtToken = async (user) => {
    const token = await jwt.sign({ user }, process.env.SESSION_SECRET);
  return token;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateJwtToken,
};
