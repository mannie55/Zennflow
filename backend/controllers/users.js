import userService from "../services/userService.js";
import { asyncHandler } from "../utils/middleware.js";

const register = asyncHandler(async (request, response) => {
  const savedUser = await userService.register(request.body);
  response.status(201).json(savedUser);
});

const login = asyncHandler(async (request, response) => {
  const result = await userService.login(request.body);
  response.status(200).send(result);
});

export default { register, login };
