import bcrypt from "bcrypt";
import User from "../models/user.js";
import helpers from "../utils/helpers.js";

const register = async ({ username, email, name, password }) => {
  if (!password || password.length < 8) {
    throw new Error("password must be at least 8 characters long");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    email,
    name,
    passwordHash,
  });

  return await user.save();
};

const login = async ({ username, password }) => {
  if (!username || !password) {
    throw new Error("username and password are required");
  }

  const user = await User.findOne({ username });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    throw new Error("invalid username or password");
  }

  const token = helpers.generateToken(user);
  return { token, username: user.username, name: user.name };
};

export default { register, login };
