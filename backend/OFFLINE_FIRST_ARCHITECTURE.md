# Offline-First Backend Architecture

This document explains the "offline-first" architectural pattern used in this backend, specifically for handling task synchronization. Understanding these concepts is key to debugging and extending the application.

---

## 1. The Core Problem: From Online-Only to Offline-First

In a traditional "online-first" application, the workflow is simple:

1. Client needs to create something.
2. It sends a `POST` request to the server.
3. The server creates the item, assigns it an ID from the database, and returns it to the client.

This breaks down the moment the client loses internet connection. An offline-first approach assumes the connection is unreliable and turns the model on its head.

**The Golden Rule:** The client is the primary source of truth. The server's job is not to command, but to **synchronize** and resolve conflicts.

---

## 2. Key Principles of Our Implementation

### a. Client-Generated IDs

- **What it is:** Instead of the database generating an ID on creation, the client (the browser extension) creates a unique ID (UUID) the moment the user creates a task.
- **Why it's crucial:** If a user is offline, they might create a task and immediately want to edit or delete it. The application needs a stable, unique ID to manage this _before_ it ever talks to the server.
- **In our code:** The `id` field in `models/task.js` is a `String` designed to store this client-generated UUID. We have disabled Mongoose's default `_id` field to make the client's `id` the one and only primary key.

### b. The "Upsert" (Update or Insert) Pattern

- **What it is:** We have replaced the traditional `POST /tasks` (create) and `PUT /tasks/:id` (update) with a single `POST /tasks/sync` endpoint.
- **Why it's better:** This endpoint accepts a batch of tasks. For each task, it decides whether to insert a new record or update an existing one. This makes the synchronization process **idempotent**—meaning a client can send the same batch of changes multiple times without causing duplicates or errors. If a network request fails halfway, the client simply tries again with the same data.
- **In our code:** The `syncTasks` function in `services/taskService.js` implements this. It checks if a task with the given `id` already exists and then routes it to an "insert" or "update" path internally.

### c. Conflict Resolution: "Last Write Wins"

This is the most critical concept for avoiding data loss and corruption.

- **What it is:** When the client wants to update a task, we need to be sure it isn't overwriting a _newer_ change that is already on the server. We use timestamps to decide which version of the data is the "truth".
- **The Key Fields:**
  - `client_updated_at`: The timestamp from the client's device, indicating when the user made the change. This is sent with every task in the sync request.
  - `server_updated_at`: A timestamp managed automatically by the server. It records when the server last touched the record.
- **The Logic:** Inside `syncTasks`, when we find an existing task, we compare timestamps:
  ```
  If incoming_task.updated_at > database_task.client_updated_at
  Then: Accept the update.
  Else: Ignore the incoming update (the server has newer data).
  ```
- **Why it's graceful:** This logic avoids `409 Conflict` errors entirely. A "conflict" is not an error; it's a normal condition that the service resolves quietly and efficiently.

### d. Batch Processing

- **What it is:** The `/api/tasks/sync` endpoint accepts an array of tasks.
- **Why it's efficient:** Instead of making one network request for every single change, the client can bundle dozens of creations and updates into a single request. This saves battery life on mobile devices, reduces network chatter, and improves performance.
- **In our code:** The `syncTasks` service uses `Task.insertMany()` and `Task.bulkWrite()` to perform these batch database operations in the most efficient way possible.

---

## 3. How to Debug

If you encounter an issue with synchronization, think through this flow:

1.  **Check the Sync Response:** The `POST /api/tasks/sync` endpoint returns a JSON report like `{ created: [...], updated: [...], failed: [...] }`. The `failed` array is your first clue—it will tell you if a task was rejected for missing a required field (`id`, `createdAt`, `updated_at`).
2.  **"My Update Didn't Work!" -> Check Timestamps:** The most common issue is a client trying to update a task with old data. If an update is ignored, it's almost certainly because the `updated_at` timestamp from the client was not newer than the `client_updated_at` value already in the database.
3.  **Unexpected `500` Error -> Check Server Logs:** If you get a generic server error, it means an _unexpected_ error occurred. The `asyncHandler` middleware caught it and passed it to the `errorHandler`. Check your server logs for details—it could be a database connection issue or a bug.
