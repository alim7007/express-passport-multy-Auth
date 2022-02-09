const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));
