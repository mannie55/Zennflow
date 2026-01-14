import sessionService from "../services/sessionService.js";
import { asyncHandler } from "../utils/middleware.js";

/**
 * Get all sessions for the logged-in user
 * @route GET /api/sessions
 * @access Private
 */
const getAllSessions = asyncHandler(async (request, response) => {
  const sessions = await sessionService.getAllSessions(request.user.id);
  response.status(200).json(sessions);
});

/**
 * Start a new session
 * @route POST /api/sessions
 * @access Private
 * @param {number} duration - Session duration in milliseconds
 * @param {string} [taskId] - Optional task ID to associate with session
 */
const startSession = asyncHandler(async (request, response) => {
  const { duration, taskId } = request.body;
  const savedSession = await sessionService.startSession(request.user.id, {
    duration,
    taskId,
  });
  response.status(201).json(savedSession);
});

/**
 * Update a session (e.g., at the end of a pomodoro)
 * @route PUT /api/sessions/:id
 * @access Private
 * @param {number} [focusedTime] - Time spent focusing in milliseconds
 * @param {boolean} [completed] - Whether the session is completed
 */
const updateSession = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { focusedTime, completed } = request.body;

  const updatedSession = await sessionService.updateSession(
    request.user.id,
    id,
    {
      focusedTime,
      completed,
    }
  );
  response.status(200).json(updatedSession);
});

/**
 * Delete a session
 * @route DELETE /api/sessions/:id
 * @access Private
 */
const deleteSession = asyncHandler(async (request, response) => {
  await sessionService.deleteSession(request.user.id, request.params.id);
  response.status(204).end();
});

export default {
  getAllSessions,
  startSession,
  updateSession,
  deleteSession,
};
