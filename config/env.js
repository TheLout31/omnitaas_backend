require("dotenv").config();

module.exports = {
  SECRET_KEY: process.env.SECRET_KEY || "super_secret_key_change_me_in_prod",
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/omnitaas",
};
