---
sidebar_position: 2
---

# Install UI with Docker (experimental)

Using Docker is a experimental way to get started with the AutoShorts UI. The Docker image contains all the necessary dependencies and resources to run the UI and backend server.

:::warning

The Docker image has not been published yet as of writing this. You can build the Docker image locally by following the instructions below. These instructions will be updated if a Docker image is published.

:::

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## Clone the repository

First, clone the AutoShorts repository:

```bash
git clone https://github.com/alamshafil/auto-shorts
cd auto-shorts
```

## Build the Docker image

Next, build the Docker image using the provided `Dockerfile`:

```bash
docker build -t auto-shorts .
```

## Run the Docker container

Finally, run the Docker container. This will start the AutoShorts UI on port 3000 and the backend server on port 3001.

:::note

The AutoShorts UI is under development and may have bugs. It currently relies on using client-side fetch to connect to the backend server. This is why port 3001 is also exposed. Port 11434 is for the Ollama server.

:::

```bash
docker run -p 3000:3000 3001:3001 11434:11434 auto-shorts
```

The AutoShorts UI should now be accessible at `http://localhost:3000`.
