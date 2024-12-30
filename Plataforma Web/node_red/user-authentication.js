// auth.js
const bcrypt = require("bcrypt");
const { connect } = require("./auth/db");

module.exports = {
  type: "credentials",
  users: async function (username) {
    try {
      const userName = username ? username.toUpperCase() : "";
      const db = await connect();
      const user = await db.collection("users").findOne({ email: userName });

      if (user) {
        return { username: user.email, permissions: "*" };
      } else {
        return null;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  authenticate: async function (username, password) {
    try {
      const userName = username ? username.toUpperCase() : "";
      const db = await connect();
      const user = await db.collection("users").findOne({ email: userName });

      if (user && (await bcrypt.compare(password, user.password))) {
        return { username: user.email, permissions: "*" };
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};
