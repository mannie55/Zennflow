import bcrypt from "bcrypt";
import User from "../models/user.js";
import helpers from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * Register a new user with username, email, name, and password
 */
const register = async ({ username, email, name, password }) => {
  // Validate required fields
  if (!username || typeof username !== "string" || username.trim().length < 3) {
    throw new Error("username is required and must be at least 3 characters");
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    throw new Error("email is required");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    throw new Error("password must be at least 8 characters long");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    name: name ? name.trim() : "",
    passwordHash,
  });

  const savedUser = await user.save();
  logger.info(`New user registered: ${username}`);
  return savedUser.toJSON();
};

/**
 * Login a user with username and password
 */
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
  logger.info(`User logged in: ${username}`);
  return { token, username: user.username, name: user.name };
};

export default { register, login };
