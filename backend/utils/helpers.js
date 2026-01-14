import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Generates a JWT token for a given user
 * Token expires in 1 hour
 * @param {Object} user - The user object from the database
 * @returns {string} The generated JWT
 */
const generateToken = (user) => {
  const userForToken = { username: user.username, id: user._id };
  return jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: "1h",
  });
};

/**
 * Generates a unique username based on a base name
 * If the base name is taken, appends a number until unique
 * @param {string} baseUsername - The desired base username
 * @returns {Promise<string>} A unique username
 */
const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let counter = 1;

  // Keep trying until we find a unique username
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
