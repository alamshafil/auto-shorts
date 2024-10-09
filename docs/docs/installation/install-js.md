---
sidebar_position: 4
---

# Install JS interface

AutoShorts comes with a JS interface that allows you to generate videos programmatically. The JS interface is the core of the package and can be used to generate videos programmatically.

First, make sure to install the package and download the necessary resources.

```bash
# Install the package
npm install auto-shorts

# Download the necessary resources (to './res' folder by default)
npx auto-shorts --download
```

You will need to download the necessary resources before running the code. You can do this by running the following command:

```bash
npx auto-shorts --download [path]
```

## AI-Generated Video
```javascript title="index.js" showLineNumbers
const task = await genVideoWithAI(
    "make a news short about TypeScript", // Provide the prompt
    AIGenType.OpenAIGen, // Use OpenAI to generate the script
    { 
        tempPath: 'video_temp', // Provide the path to the temporary video folder
        resPath: 'res', // Provide the path to the downloaded resources folder
        voiceGenType: VoiceGenType.ElevenLabsVoice, // Use ElevenLabs to generate the voice
        imageGenType: ImageGenType.PexelsImageGen, // Use Pexels to generate the image
        apiKeys: {
            elevenLabsAPIKey: process.env.ELEVENLABS_API_KEY, // Provide the ElevenLabs API key
            pexelsAPIKey: process.env.PEXELS_API_KEY, // Provide the Pexels API key
        }
    }, 
    process.env.OPENAI_API_KEY // Provide the OpenAI API key
);

task.on('log', (log) => {
    console.info(log);
});

task.on('done', (output) => {
    console.info("--> Video generation complete! Video saved at: " + output);
});
```

## Manual Video
```javascript title="index.js" showLineNumbers
/** @type {import("auto-shorts").VideoDataType} */
const data = {
    type: "topic", // Provide the type of video
    title: "TypeScript", // Provide the title of the video
    start_script: "Hello! Today we will be talking about TypeScript.", // Provide the start script of the video
    end_script: "That's all for today. Thanks for watching!", // Provide the end script of the video
    images: ["typescript logo"] // Provide the images for the video
};

const task = await genVideoWithJson(
    data, {
    tempPath: 'video_temp', // Provide the path to the temporary video folder
    resPath: 'res', // Provide the path to the downloaded resources folder
    voiceGenType: VoiceGenType.ElevenLabsVoice, // Use ElevenLabs to generate the voice
    imageGenType: ImageGenType.PexelsImageGen, // Use Google Scraper to generate the image
    apiKeys: {
        elevenLabsAPIKey: process.env.ELEVENLABS_API_KEY, // Provide the ElevenLabs API key
        pexelsAPIKey: process.env.PEXELS_API_KEY, // Provide the Pexels API key
    }
});

task.on('log', (log) => {
    console.log(log);
});

task.on('done', (output) => {
    console.info("--> Video generation complete! Video saved at: " + output);
});
```
