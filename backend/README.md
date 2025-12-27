# Zennflow Backend

This directory contains the backend server for Zennflow, a developer-centric productivity and organization tool. The backend is a Node.js application built with Express, providing a RESTful API to manage users, tasks, and focus sessions.

## Tech Stack

- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Authentication**: JSON Web Tokens (JWT) and Google OAuth
- **Password Hashing**: [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **Middleware**: CORS, custom middleware for user extraction

## Directory Structure

The backend codebase is organized into the following directories:

```
backend/
├───controllers/    # Handles the logic for each route
├───models/         # Mongoose schemas for the database
├───routes/         # Express route definitions
├───services/       # Business logic and database operations
├───utils/          # Utility functions and middleware
├───app.js          # Express application setup
├───db.js           # MongoDB connection setup
└───index.js        # Entry point for the server
```

## Getting Started

Follow these instructions to get the backend server up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running

### Installation & Setup

1.  **Clone the repository** (if you haven't already).

2.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **Create a `.env` file** in the `backend` root directory. This file will store your environment variables.
    ```
    PORT=3001
    MONGODB_URI=<your_mongodb_connection_string>
    SECRET=<your_jwt_secret>
    GOOGLE_CLIENT_ID=<your_google_client_id>
    ```

5.  **Start the server**:
    -   For development with auto-reloading:
        ```bash
        npm run dev
        ```
    -   For production:
        ```bash
        npm start
        ```

The server will start on the port specified in your `.env` file (e.g., `http://localhost:3001`).

## API Endpoints

The API is structured into several resources. All routes are prefixed with `/api`. For example, the `login` route is accessible at `http://localhost:3001/api/users/login`.

---

### Authentication (`/api/auth`)

-   **`POST /google`**: Authenticate a user with a Google ID token.
    -   **Body**: `{ "token": "..." }`

---

### Users (`/api/users`)

-   **`POST /register`**: Register a new user.
    -   **Body**: `{ "username": "...", "password": "..." }`
-   **`POST /login`**: Log in an existing user.
    -   **Body**: `{ "username": "...", "password": "..." }`

---

### Tasks (`/api/tasks`)

*Authentication required for all task routes.*

-   **`GET /`**: Fetches all tasks for the authenticated user.
-   **`POST /sync`**: Synchronizes tasks for the authenticated user. Used for offline-first capabilities.
    -   **Body**: An array of task objects.
-   **`DELETE /:id`**: Deletes a specific task by its ID.

---

### Focus Sessions (`/api/sessions`)

*Authentication required for all session routes.*

-   **`GET /`**: Fetches all focus sessions for the authenticated user.
-   **`POST /`**: Starts a new focus session.
-   **`PUT /:id`**: Updates an existing focus session by its ID.
-   **`DELETE /:id`**: Deletes a specific focus session by its ID.
