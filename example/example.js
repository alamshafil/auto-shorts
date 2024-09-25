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

const task = await genVideoWithJson(
    data, {
    tempPath: 'video_temp',
    resPath: 'res',
    voiceGenType: VoiceGenType.ElevenLabsVoice,
    imageGenType: ImageGenType.GoogleScraperImageGen,
    elevenLabsAPIKey: process.env.ELEVENLABS_API_KEY,
    pexelsAPIKey: process.env.PEXELS_API_KEY,
});

task.on('log', (log) => {
    console.log(log);
});

task.on('done', (output) => {
    console.info("--> Video generation complete! Video saved at: " + output);
});
