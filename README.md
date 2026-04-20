# Dialogflow ES WebSocket Chat

Real-time chat application using a WebSocket server to relay messages between a React frontend and Google Dialogflow ES.

## Architecture (Professional Layered Design)

The backend follows a professional, layered architecture to ensure scalability and maintainability:

1.  **Entry Point (`src/server.js`)**: Initializes the HTTP and WebSocket servers.
2.  **App (`src/app.js`)**: Configures Express, CORS, and global middlewares.
3.  **Controllers (`src/controllers/`)**: Manages WebSocket events and coordinates between services.
4.  **Services (`src/services/`)**: Handles core business logic, such as communicating with Dialogflow ES.
5.  **Repositories (`src/repositories/`)**: Abstracts Data Access (e.g., In-memory session store).
6.  **Utils (`src/utils/`)**: Shared utilities like Google Auth management.

## Project Structure

```text
/server
  /src
    /controllers    # WebSocket and Route handlers
    /services       # Business & Dialogflow logic
    /repositories   # Data abstraction (Sessions)
    /utils          # Google Auth & Helpers
    app.js          # Express app configuration
    server.js       # Main entry point
  package.json
/client
  /src              # React Frontend
```

## Prerequisites

- Node.js (v16 or higher)
- A Google Cloud Project with Dialogflow API enabled.
- A service account with `Dialogflow API Client` role and its JSON key file.

## Setup Instructions

### 1. Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file from `.env.example`:
    ```bash
    cp .env.example .env
    ```
4.  Configure your `.env` file with your Google Cloud Project ID and the path to your service account JSON key:
    ```env
    DIALOGFLOW_PROJECT_ID=your-project-id
    GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account.json
    ```
5.  Start the server:
    ```bash
    npm start
    ```

### 2. Frontend Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Functionality Overview

### Real-time Communication
The app uses a bi-directional WebSocket connection. When a user sends a message, it's immediately pushed to the server. The server asynchronously calls the Dialogflow ES API, waits for the response, and then pushes it back to the specific client.

### Error Handling
- **WebSocket**: Handles connection drops and reconnection states in the UI.
- **Dialogflow**: Catches API errors (like invalid credentials or quota issues) and notifies the client.
- **UI**: Visual feedback for connection status (Online/Offline).

## Design Decisions
- **Express + ws**: Used for a lightweight yet robust backend relay.
- **React + Vite**: Chosen for fast development and a smooth, modern user experience.
- **Official SDK**: Using `@google-cloud/dialogflow` ensures reliable communication with Google's APIs.