---
sidebar_position: 4
---

# Tools and APIs available

AutoShorts uses a variety of tools and APIs to generate videos. You can use these tools to generate different types of videos.

## Tools available

These are the tools available in AutoShorts:

### Voice Generation

You can use these tools to generate voice for the videos:

- ElevenLabs
- Neets.ai
- Local TTS on system

### Image Generation

You can use these tools to generate images for the videos:

- Pexels
- Scraper

### AI Script Generation

You can use these tools to generate scripts for the videos:

- OpenAI (and compatible endpoints like Ollama, Groq, etc.) (e.g., GPT-4o)
- Google Gemini AI (e.g., Gemini 1.5 Pro/Flash)
- Anthropic (e.g, Claude)
- Ollama local LLMs (e.g., llama3.2)

## API Keys

This package uses AI tools like OpenAI and ElevenLabs to generate scripts and images. You need to provide the API keys for these tools to use this package.

You need to provide the following API key depending on what tools you want to use:

### Voice Generation
- ElevenLabs API Key
- Neets.ai API Key

### Image Generation
- Pexels API Key

### AI Script Generation
- OpenAI API Key
- Google Gemini AI API Key
- Anthropic (Claude) API Key

Make sure to provide the API keys in the environment variables with a package like `dotenv`.
