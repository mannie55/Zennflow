# Zennflow Frontend

This is the frontend for Zennflow, a developer-centric productivity and organization tool. It is a Chrome Extension built with React and Vite.

## Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Fetching**: [React Query](https://tanstack.com/query/v5) & [Axios](https://axios-http.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Chrome Extension Tooling**: [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)

## Directory Structure

The frontend codebase is organized as follows:

```
frontend/
├───public/         # Static assets
├───src/            # Source code
│   ├───apiService/   # Functions for making API calls
│   ├───assets/       # Images, icons, etc.
│   ├───components/   # Reusable React components
│   ├───content/      # Content scripts for the Chrome extension
│   ├───context/      # React context providers
│   ├───hooks/        # Custom React hooks
│   ├───newTab/       # Code for the new tab page
│   ├───pages/        # Top-level page components
│   ├───popup/        # Code for the extension's popup
│   └───services/     # Business logic services
├───vite.config.js  # Vite configuration
└───manifest.config.js # Configuration for the Chrome extension manifest
```

## Getting Started

Follow these instructions to get the frontend running on your local machine for development.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)

### Installation & Setup

1.  **Clone the repository** (if you haven't already).

2.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

### Loading the Extension in Chrome

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode" in the top right corner.
3.  Click "Load unpacked".
4.  Select the `frontend/dist` directory. The `dist` directory is generated when you run `npm run dev` or `npm run build`.

## Available Scripts

In the project directory, you can run:

-   **`npm run dev`**: Runs the app in development mode using Vite. This will also create the `dist` folder for the unpacked extension.
-   **`npm run build`**: Builds the app for production to the `dist` folder.
-   **`npm run preview`**: Serves the production build locally for preview.

## Building for Production

To create a production-ready build of the extension, run:

```bash
npm run build
```

This will create a `dist` folder with the optimized and minified production code. You can then zip this folder to upload to the Chrome Web Store.