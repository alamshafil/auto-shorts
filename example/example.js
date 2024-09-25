// Example of auto-shorts usage

import { genVideoWithJson, VoiceGenType, ImageGenType } from 'auto-shorts';

/** @type {import("auto-shorts").VideoDataType} */
const data = {
    type: "topic",
    title: "TypeScript",
    description: "TypeScript is a programming language...",
    start_script: "Hello! Today we will be talking about TypeScript.",
    end_script: "That's all for today. Thanks for watching!",
    images: ["typescript logo"]
};

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
    console.log(log);
});

task.on('done', (output) => {
    console.info("--> Video generation complete! Video saved at: " + output);
});
