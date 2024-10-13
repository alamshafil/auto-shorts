---
sidebar_position: 3
---

# Configuration

## CLI options

This document provides detailed information about the CLI options available for the AutoShorts AI video generator.

To display the help message with all available options, run:

```bash
npx auto-shorts --help
```

### Options

#### Main Options

- `--download`: Download models needed for AI generation.

- `--server`: Start API server. IP and port come from environment variables.

- `--deleteTemp`: Delete temporary files after video generation.

- `-p`, `--prompt [text]`: The prompt to use for the AI to generate video.

- `--aiType [type]`: The AI provider to use. Can be OpenAIGen, GoogleAIGen, AnthropicAIGen, OllamaAIGen.

- `--ttsType [type]`: The TTS provider to use. Can be ElevenLabs, BuiltinTTS, NeetsTTS.

- `--imageType [type]`: The image provider to use. Can be Pexels, GoogleScraper, and more.

- `--orientation [orientation]`: The orientation of the video. Options are vertical or horizontal.

- `--tempPath [path]`: The temporary path to save video files. Default is ./video_temp.

- `--resPath [path]`: The path to the resources directory. Default is ./res.

- `--jsonFile [path]`: The JSON file to use for video generation. Overrides AI.

- `-h, --help`: Print the usage guide.

#### TTS Options

- `--ttsMaleVoice [voice]`: TTS male voice to use. If applicable.
- `--ttsFemaleVoice [voice]`: TTS female voice to use If applicable.
- `--ttsVoiceModel [model]`: TTS voice model to use. If applicable.

#### Image Options

- `--imgAIModel [model]`: AI model to use for image generation. If applicable.
- `--imgAIPrompt [prompt]`: AI suffix prompt to use for image generation. If applicable.

#### Subtitle Options

- `--subtitleLen [number]`: Subtitle token length override.
- `--subFontName [font]`: Subtitle font name override.
- `--subFontSize [number]`: Subtitle font size override.
- `--subFontColor [color]`: Subtitle font color override.
- `--subStrokeColor [color]`: Subtitle stroke color override.
- `--subStrokeWidth [number]`: Subtitle stroke width override

#### Advanced Options

- `--changePhotos`: Change photos in video. Used to prevent overriding wanted photos. Default is true.

- `--disableTTS`: Disable TTS in video. Used to prevent overriding wanted TTS. Default is false.

- `--bgMusic [path]`: Use custom background music.

- `--bgVideo [path]`: Use custom background video, if applicable.

- `--useMock`: Use mock JSON data. Default is false.

- `--disableSubtitles`: Disable subtitles in video. Default is false.

- `--systemPromptOverride [text]`: Override system prompt. May not work with all AI types.

- `--openAIEndpoint [endpoint]`: OpenAI endpoint URL to use, if applicable.

- `--model model`: AI model to use, if applicable.

### API Keys

:::note

Note: Some of the following API keys are optional and only required if you are using the corresponding AI provider.

Also API keys can be set in the environment variables via the `.env` file in root.

:::

- `--elevenlabsAPIKey [key]`: Eleven Labs API key, if applicable. OR set `ELEVENLABS_API_KEY` in environment variables.

- `--pexelsAPIKey [key]`: Pexels API key, if applicable. OR set `PEXELS_API_KEY` in environment variables.

- `--neetsAPIKey [key]`: Neets API key, if applicable. OR set `NEETS_API_KEY` in environment variables.

- `--openaiAPIKey [key]`: OpenAI API key, if applicable. OR set `OPENAI_API_KEY` in environment variables.

- `--googleaiAPIKey [key]`: Google AI API key, if applicable. OR set `GOOGLE_AI_API_KEY` in environment variables.

- `--anthropicAPIKey [key]`: Anthropic AI API key, if applicable. OR set `ANTHROPIC_API_KEY` in environment variables.

**Created by Shafil Alam.**
