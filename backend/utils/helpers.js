import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Generates a JWT for a given user.
 * @param {object} user - The user object from the database.
 * @returns {string} The generated JWT.
 */
const generateToken = (user) => {
  const userForToken = { username: user.username, id: user._id };
  return jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: "1h",
  });
};

/**
 * Generates a unique username based on a base name.
 * If the base name is taken, it appends a number until a unique name is found.
 * @param {string} baseUsername - The desired base username.
 * @returns {Promise<string>} A unique username.
 */
const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter += 1;
  }
  return username;
};

export default {
  generateToken,
  generateUniqueUsername,
};
