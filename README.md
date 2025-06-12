# Wiz AI Tools - Vanilla JS & Node.js Version

## 1. Project Overview

This project is a conversion of the original Next.js "Wiz AI Tools" application. It has been refactored into two main components:

*   **`frontend/`**: A static vanilla HTML, CSS, and JavaScript application providing the user interface.
*   **`ai-backend/`**: A Node.js application using Express.js and Genkit to serve AI functionalities.

This separation allows for a more traditional client-server architecture.

## 2. Backend Setup (`ai-backend/`)

The backend server handles all AI-related processing using Genkit.

**Steps to run the backend:**

1.  **Navigate to the backend directory:**
    ```bash
    cd ai-backend
    ```

2.  **Install dependencies:**
    If `node_modules` is not already present (e.g., on a fresh checkout), install the necessary packages:
    ```bash
    npm install
    ```

3.  **Build TypeScript:**
    The backend is written in TypeScript. Compile it to JavaScript using:
    ```bash
    npm run build
    ```
    *   **Known Issue:** The build process may report TypeScript type errors (specifically TS2769 in `src/server.ts` related to Express route handlers). These errors do not currently affect the runtime functionality of the generated JavaScript, and the server operates as expected.

4.  **API Key Configuration (Important!):**
    The AI functionalities rely on Google AI services via Genkit. You **must** configure your API keys for these services to work.
    *   Set either `GOOGLE_API_KEY` or `GEMINI_API_KEY` as an environment variable in your system.
        ```bash
        # Example (replace with your actual key):
        export GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```
    *   Refer to the [Genkit Google AI Plugin Documentation](https://genkit.dev/docs/plugins/google-genai) for more details on API key setup.

    *   **Alternative for Local Development: `config.local.json`**
        For local development convenience, you can create a file named `config.local.json` inside the `ai-backend/src/` directory. The backend server will attempt to read the `GOOGLE_API_KEY` from this file if it exists.

        Create `ai-backend/src/config.local.json` with the following structure:
        ```json
        {
          "GOOGLE_API_KEY": "YOUR_ACTUAL_API_KEY_HERE"
        }
        ```
        If this file is present and contains a valid key, that key will be used. Otherwise, the server will fall back to checking for the environment variables mentioned above.

        > **WARNING:** This method is intended for **local development convenience ONLY**.
        > The `ai-backend/src/config.local.json` file **MUST NOT be committed to version control or shared.**
        > It is already listed in `ai-backend/.gitignore` to help prevent accidental commits.
        > Using environment variables is the standard and more secure method for managing API keys, especially for production or any shared environment.

    *   Without a valid API key (either from `config.local.json` or environment variables), AI-related API endpoints will return an error.

5.  **Run the server:**
    Once built and configured, start the server using:
    ```bash
    npm run serve
    ```
    This will start the backend server, typically on `http://localhost:3001`. The console will confirm the listening port.
    *   CORS (Cross-Origin Resource Sharing) is enabled on this server by default (all origins) to facilitate local development when the frontend is served from a different port (e.g., 8080).

## 3. Frontend Usage

The frontend consists of a main `index.html` at the repository root, with supporting static assets (CSS, JS, other HTML pages) located in the `frontend/` directory. It interacts with the `ai-backend` for dynamic AI features.

**Steps to run the frontend:**

1.  **Navigate to the repository root directory.**
    Your command prompt should be in the main project directory (the one containing `index.html` and the `frontend/` and `ai-backend/` folders).

2.  **Serve the project root directory:**
    You need a simple HTTP server to serve these files. Here are a couple of common methods:

    *   **Using `npx serve` (Node.js required):**
        If you have Node.js and npx available, run from the repository root:
        ```bash
        npx serve . -l 8080
        ```
        (The `.` indicates the current directory. The `-l 8080` flag specifies port 8080. You can use another port if 8080 is busy.)
        If you don't have `serve` installed globally, npx may offer to download it.

    *   **Using Python's built-in HTTP server:**
        If you have Python 3 installed, run from the repository root:
        ```bash
        python3 -m http.server 8080
        ```
        (This also serves on port 8080. For Python 2, the command is `python -m SimpleHTTPServer 8080` but Python 3 is recommended.)

3.  **Access the application:**
    Open your web browser and navigate to:
    `http://localhost:8080/` or `http://localhost:8080/index.html` (or the port you chose for serving).

**Available Features:**

The application provides the following features:

*   **Home/Navigation:** `index.html` (at the root) - The main landing and navigation page.
*   **Chat with Wiz:** `frontend/chat.html` - An interactive chat interface with an AI assistant.
*   **Image Analysis:** `frontend/image-analysis.html` - Upload an image to get an AI-generated description.
*   **Text Summarization:** `frontend/text-summarization.html` - Paste text to receive a concise summary.

## 4. Deployment

To use the AI features with the frontend hosted statically (e.g., on GitHub Pages, Netlify, Vercel, etc.), the `ai-backend` needs to be deployed separately as a Node.js application on a suitable hosting platform (e.g., Render.com, Heroku, Google Cloud Run, Fly.io). GitHub Pages itself cannot run the Node.js backend server.

**Frontend Configuration for Deployed Backend:**

Once your `ai-backend` is deployed and you have a public URL for it (e.g., `https://your-ai-backend-service.com`), you must update the `API_BASE_URL` constant at the top of the following frontend JavaScript files:

*   `frontend/chat.js`
*   `frontend/image-analysis.js`
*   `frontend/text-summarization.js`

Change the line:
```javascript
const API_BASE_URL = '';
```
to your backend's public URL:
```javascript
const API_BASE_URL = 'https://your-ai-backend-service.com';
```

**Local Development Note:**
If `API_BASE_URL` is left as an empty string (the default), the frontend will attempt to use relative paths for API calls (e.g., `/api/chat`). This is suitable for local development where the frontend (e.g., served from `http://localhost:8080`) and backend (e.g., running on `http://localhost:3001`) are on the same machine, and the backend has CORS enabled to allow these cross-port requests.

## 5. Project Structure

```
.
├── ai-backend/
│   ├── src/
│   │   ├── server.ts       # Main backend Express server
│   │   ├── genkit.ts       # Genkit AI configuration
│   │   └── flows/          # AI flow definitions (chat, image analysis, summarization)
│   ├── dist/               # Compiled JavaScript output from TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── frontend/
│   ├── common.css          # Shared styles for all frontend pages
│   ├── chat.html           # Chat interface HTML
│   ├── chat.css            # Styles specific to chat.html
│   ├── chat.js             # JavaScript for chat.html
│   ├── image-analysis.html # Image analysis interface HTML
│   ├── image-analysis.css  # Styles specific to image-analysis.html
│   ├── image-analysis.js   # JavaScript for image-analysis.html
│   ├── text-summarization.html # Text summarization interface HTML
│   ├── text-summarization.css  # Styles specific to text-summarization.html
│   ├── text-summarization.js   # JavaScript for text-summarization.html
│   └── ...
├── index.html              # Main landing page (at root)
└── README.md               # This file
```

---
Enjoy using Wiz AI Tools!The `README.md` file has been created at the root of the repository with the specified content.

**Summary of README.md Content:**

1.  **Project Overview:**
    *   Explains the conversion from Next.js to vanilla frontend and Node.js backend.
    *   Identifies the `frontend/` and `ai-backend/` directories.

2.  **Backend Setup (`ai-backend/`):**
    *   Covers navigation, `npm install`, and `npm run build`.
    *   **Crucially, highlights API Key Configuration** for Google AI services (Genkit), specifying the need for `GOOGLE_API_KEY` or `GEMINI_API_KEY` environment variables.
    *   Mentions how to run the server (`npm run serve`) and the default port (`3001`).
    *   Acknowledges the known TypeScript build errors (TS2769) but notes they don't affect runtime.

3.  **Frontend Usage (`frontend/`):**
    *   Explains that it's static content requiring an HTTP server.
    *   Provides examples using `npx serve` and Python's `http.server`.
    *   Specifies how to access the app via `index.html` and the chosen port.
    *   Lists the available features and their corresponding HTML files.

4.  **Project Structure:**
    *   Includes a tree-like structure showing the main directories and key files in both `ai-backend/` and `frontend/`.

5.  **Formatting:**
    *   Uses Markdown for headings, lists, code blocks (for commands), and emphasis for clarity.

All specified requirements for the `README.md` have been met. The file provides a comprehensive guide for setting up and running both the backend and frontend components of the application.
