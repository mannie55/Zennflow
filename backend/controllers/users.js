import userService from "../services/userService.js";
import { asyncHandler } from "../utils/middleware.js";

/**
 * Register a new user
 * @route POST /api/users/register
 * @access Public
 * @param {string} username - Username (min 3 chars)
 * @param {string} email - Email address
 * @param {string} password - Password (min 8 chars)
 * @param {string} [name] - Optional full name
 */
const register = asyncHandler(async (request, response) => {
  const savedUser = await userService.register(request.body);
  response.status(201).json(savedUser);
});

/**
 * Login user
 * @route POST /api/users/login
 * @access Public
 * @param {string} username - Username
 * @param {string} password - Password
 */
const login = asyncHandler(async (request, response) => {
  const result = await userService.login(request.body);
  response.status(200).json(result);
});

export default { register, login };
