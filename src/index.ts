// Copyright (c) 2024 Shafil Alam

/**
 * This file contains the main function the AutoShorts AI video generator.
 * 
 * @packageDocumentation
 */

import { AIGenType, AnthropicAIGen, GoogleAIGen, OllamaAIGen, OpenAIGen, AIOptions } from './ai';
import { VideoDataType, VideoGenType, VideoOptions, InternalVideoOptions } from './videogen';
import { TopicVideo } from "./types/topicVid";
import { MsgVideo } from './types/msgVid';
import { RatherVideo } from './types/ratherVid';
import { RankVideo } from './types/rankVid';
import { QuizVideo } from './types/quizVid';
import { builtin_ai_system_prompt, mockAiData } from "./const";

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

import { ElevenLabsOptions, VoiceGenOptions, VoiceGenType } from './tts';
import { ImageGenType } from './image';

export { 
    AIGenType, 
    VideoDataType, 
    VideoGenType, 
    VideoOptions, 
    InternalVideoOptions,
    VoiceGenType, 
    VoiceGenOptions, 
    ElevenLabsOptions, 
    ImageGenType
};

/**
 * Generate video based on user comment and AI response
 * 
 * @param prompt Prompt for AI to generate script (can be user comment, etc.)
 * @param aiType AI type (ex. OllamaAIGen)
 * @param options Video options
 * @param customSystemPrompt Custom system prompt to override built-in prompt (optional)
 * @param aiOptions AI options (optional)
 * @param aiAPIKey AI API key (optional)
 * 
 * @example
 * ```typescript
 *  await genVideoWithAI(
 *  "make a news short about TypeScript",
 *  AIGenType.OllamaAIGen, {
 *      tempPath: 'video_temp',
 *      resPath: 'res',
 *      voiceGenType: VoiceGenType.ElevenLabsVoice,
 *      imageGenType: ImageGenType.PexelsImageGen,
 *      elevenLabsAPIKey: process.env.ELEVENLABS_API_KEY,
 *      pexelsAPIKey: process.env.PEXELS_API_KEY,
 *  });
 * ```
 */
export async function genVideoWithAI(prompt: string, aiType: AIGenType, options: VideoOptions, customSystemPrompt?: string, aiOptions?: AIOptions, aiAPIKey?: string) : Promise<EventEmitter> {
    const log = (msg: string) => {
        if (options.internalOptions?.debug) console.info(msg);
    }
    
    const userComment = prompt;

    // Add user comment to system prompt
    const systemPrompt = customSystemPrompt 
        ? customSystemPrompt + userComment
        : builtin_ai_system_prompt + userComment;

    let ai_response = '';

    async function genAI(): Promise<string> {
        switch (aiType) {
            case AIGenType.OllamaAIGen:
                return await OllamaAIGen.generate(log, systemPrompt, aiOptions);
            case AIGenType.OpenAIGen:
                return await OpenAIGen.generate(log, systemPrompt, aiAPIKey, aiOptions);
            case AIGenType.GoogleAIGen:
                return await GoogleAIGen.generate(log, systemPrompt, aiAPIKey, aiOptions);
            case AIGenType.AnthropicAIGen:
                return await AnthropicAIGen.generate(log, systemPrompt, aiAPIKey, aiOptions);
            default:
                throw new Error("Invalid AI type: " + aiType);
        }
    }

    if (!options.internalOptions?.useMock) {
        log("Generating video script...");
        ai_response = await genAI();
    } else {
        ai_response = mockAiData;
    }

    // Debug print
    log(`Final response: \n${ai_response}`);

    log("Video script generated successfully!");

    // Generate video based on AI response
    return await genVideo(ai_response, options);
}

/** 
 * Generate video based on JSON data
 * 
 * @param data JSON data for video
 * @param options Video options
 * 
 * @example
 * ```typescript
 * await genVideoWithJson({
 *  "type": "topic",
 *  "title": "TypeScript",
 *  "description": "TypeScript is a programming language...",
 *  "start_script": "Hello! Today we will be talking about TypeScript.",
 *  "end_script": "That's all for today. Thanks for watching!",
 *  "images": ["typescript logo"]
 * }, {
 *  tempPath: 'video_temp',
 *  resPath: 'res',
 *  voiceGenType: VoiceGenType.ElevenLabsVoice,
 *  imageGenType: ImageGenType.GoogleScraperImageGen,
 *  elevenLabsAPIKey: process.env.ELEVENLABS_API_KEY,
 *  pexelsAPIKey: process.env.PEXELS_API_KEY,
 * });
 * ```
 */
export async function genVideoWithJson(data: VideoDataType, options: VideoOptions) : Promise<EventEmitter> {
    // Convert video data to JSON string type safely
    const jsonDataStr: string = JSON.stringify(data);

    return await genVideo(jsonDataStr, options);   
}

/** 
 * Internal function to generate video based on JSON data
 * 
 * @param jsonDataStr JSON data for video
 * @param options Video options
 * 
 */
async function genVideo(jsonDataStr: string, options: VideoOptions) : Promise<EventEmitter> {
    // Check JSON data
    if (!jsonDataStr) {
        throw new Error("Empty JSON data!");
    }

    let jsonData;

    try {
        jsonData = JSON.parse(jsonDataStr);
    } catch (e: any) {
        console.error("Invalid JSON data: " + (e.message ?? e));
        throw new Error("Invalid JSON data!");
    }

    if (jsonData["type"] == undefined) {
        throw new Error("Invalid JSON data! Missing 'type' field.");
    }

    checkResDir(options.resPath);

    const type = jsonData["type"];

    let vid;
    switch (type) {
        case VideoGenType.TopicVideo:
            vid = new TopicVideo(options, jsonData);
            vid.generateVideo();
            return vid.emitter;
        case VideoGenType.TextMessageVideo:
            vid = new MsgVideo(options, jsonData);
            vid.generateVideo();
            return vid.emitter;
        case VideoGenType.RatherVideo:
            vid = new RatherVideo(options, jsonData);
            vid.generateVideo();
            return vid.emitter;
        case VideoGenType.RankVideo:
            vid = new RankVideo(options, jsonData);
            vid.generateVideo();
            return vid.emitter;
        case VideoGenType.QuizVideo:
            vid = new QuizVideo(options, jsonData);
            vid.generateVideo();
            return vid.emitter;
        default:
            throw Error("Invalid video type!");
    }
}

/**
 * Check if res path includes necessary folders
 * 
 * @param resPath Resource path
 */
export function checkResDir(resPath: string) {
    // Check res path if includes folders named: models, vid, music
    const foldersToCheck = ["models", "vid", "music"];

    for (const folder of foldersToCheck) {
        const folderPath = path.join(resPath, folder);
        if (!fs.existsSync(folderPath)) {
            throw new Error(`Resource folder is missing folder: ${folderPath}.\nTry running "npx auto-shorts --download --resPath [folder]" to download resources.`);
        }
    }
}
