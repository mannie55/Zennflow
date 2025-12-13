import sessionService from "../services/sessionService.js";
import { asyncHandler } from "../utils/middleware.js";

// @desc    Get all sessions for a user
// @route   GET /api/sessions
// @access  Private
const getAllSessions = asyncHandler(async (request, response) => {
  const sessions = await sessionService.getAllSessions(request.user.id);
  response.json(sessions);
});

// @desc    Start a new session
// @route   POST /api/sessions
// @access  Private
const startSession = asyncHandler(async (request, response) => {
  const { duration, taskId } = request.body;
  const savedSession = await sessionService.startSession(request.user.id, {
    duration,
    taskId,
  });
  response.status(201).json(savedSession);
});

// @desc    Update a session (e.g., at the end of a pomodoro)
// @route   PUT /api/sessions/:id
// @access  Private
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
  response.json(updatedSession);
});

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private
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
