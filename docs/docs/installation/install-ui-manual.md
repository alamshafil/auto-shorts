---
sidebar_position: 1
---

# Install UI Manually

AutoShorts comes with a web UI that allows you to generate videos with a simple interface. The UI is built with Next.js and Express.js. The web UI relies on the backend server. 

:::note

The web UI is in the early stages of development and may have bugs. The UI is not meant to be used in production environments yet. If you encounter any issues, please create an issue on the GitHub repo. Feel free to contribute to the UI by creating a pull request.

:::

This example will clone the repository and start the backend server and frontend server.

## Clone the repository and install dependencies

```bash
git clone https://github.com/alamshafil/auto-shorts
cd auto-shorts
npm install
npm run install-ui-deps
```

## Setup backend server

Copy the `.env.example` file to a new `.env` file in the root directory and fill in the necessary information:

```bash
cp .env.example .env
```

The sample `.env` file by default uses the following environment variables:

```bash title=".env"
# # LLMs
# OPENAI_API_KEY="key here"
# GOOGLE_AI_API_KEY="key here"
# ANTHROPIC_API_KEY="key here"
# # TTS
# ELEVENLABS_API_KEY="key here"
# NEETS_API_KEY="key here"
# # Image
# PEXELS_API_KEY="key here"

# Backend Server Config
SERVER_RES_PATH="res" # Download from "npx auto-shorts --download [path]"
SERVER_TEMP_PATH="video_temp" # Can be any path like "video_temp"
SERVER_IP="localhost"
SERVER_PORT=3001 # Can be any port number like 3001
```

You can provide the necessary API keys for the AI tools and image generation tools in the `.env` file by uncommenting the necessary lines and providing the keys.

You can also change the backend server configuration like the resource path, temporary path, IP, and port number.

## Setup frontend server

Copy the `.env.example` file to a new `.env` file in the `ui` folder and fill in the necessary information:

```bash
cp ui/.env.example ui/.env
```

The sample `ui/.env` file by default uses the following environment variables:

```bash title="ui/.env"
# Server Config
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001" # Use the same port number as the backend server (ex: http://localhost:3001)
```

If you changed the port number in the backend server configuration, make sure to change the `NEXT_PUBLIC_BACKEND_URL` to the same port number. In this case, the port number is 3001.

Then, run the following commands to start the backend server and frontend server:

```bash
npm run start-all
```

The web UI should now be accessible at `http://localhost:3000`.
