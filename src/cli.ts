#!/usr/bin/env node

// Copyright (c) 2024 Shafil Alam

import 'console-info'
import 'console-error'
import 'dotenv/config'

import { checkResDir, genVideo, genVideoDataWithAI, genVideoWithJson, VideoOptions } from ".";

import { AIAPIEnv, AIGenType, AnthropicAIGen, GoogleAIGen, OllamaAIGen, OpenAIGen } from "./ai";
import { VoiceAPIEnv, VoiceGenType } from "./tts";
import { ImageAPIEnv, ImageGenType } from "./image";
import { runAPIServer } from './server';

import fs from "fs";
import path from "path";

import { input, select } from "@inquirer/prompts";
import commandLineArgs from "command-line-args";
import commandLineUsage from 'command-line-usage';
import download from './download';

// TODO: Clean code

/**
 * CLI for AutoShorts AI video generator
 */
async function cli() {
    // Setup args
    const mainOptions = [
        {
            name: 'download',
            type: Boolean,
            description: 'Download models needed for AI generation.'
        },
        {
            name: 'server',
            type: Boolean,
            description: 'Start API server. IP and port comes from env variable.'
        },
        {
            name: 'prompt',
            alias: 'p',
            typeLabel: '{underline text}',
            description: 'The prompt to use for the AI to generate video.'
        },
        {
            name: 'aiType',
            typeLabel: '{underline type}',
            description: `The AI provider to use. Can be {italic ${Object.keys(AIGenType).join(", ")}.}`
        },
        {
            name: 'ttsType',
            typeLabel: '{underline type}',
            description: `The TTS provider to use. Can be {italic ${Object.keys(VoiceGenType).join(", ")}.}`
        },
        {
            name: 'imageType',
            typeLabel: '{underline type}',
            description: `The image provider to use. Can be {italic ${Object.keys(ImageGenType).join(", ")}.}`
        },
        {
            name: 'orientation',
            typeLabel: '{underline orientation}',
            description: 'The orientation of the video. {italic (vertical, horizontal)}'
        },
        {
            name: 'tempPath',
            typeLabel: '{underline path}',
            description: 'The temporary path to save video files. {bold (default: ./video_temp)}'
        },
        {
            name: 'resPath',
            typeLabel: '{underline path}',
            description: 'The path to the resources directory. {bold (default: ./res)}'
        },
        {
            name: 'jsonFile',
            typeLabel: '{underline path}',
            description: 'The JSON file to use for video generation. {italic Overrides AI.}'
        },
        {
            name: 'help',
            type: Boolean,
            alias: 'h',
            description: 'Print this usage guide.'
        }
    ];

    const apiOptions = [
        {
            name: 'elevenlabsAPIKey',
            typeLabel: '{underline key}',
            description: 'Eleven Labs API key. {italic If applicable.}'
        },
        {
            name: 'pexelsAPIKey',
            typeLabel: '{underline key}',
            description: 'Pexels API key. {italic If applicable.}'
        },
        {
            name: 'neetsAPIKey',
            typeLabel: '{underline key}',
            description: 'Neets API key. {italic If applicable.}'
        },
        {
            name: 'openaiAPIKey',
            typeLabel: '{underline key}',
            description: 'OpenAI API key. {italic If applicable.}'
        },
        {
            name: 'googleaiAPIKey',
            typeLabel: '{underline key}',
            description: 'Google AI API key. {italic If applicable.}'
        },
        {
            name: 'anthropicAPIKey',
            typeLabel: '{underline key}',
            description: 'Anthropic AI API key. {italic If applicable.}'
        }
    ];

    const advancedOptions = [
        {
            name: 'changePhotos',
            type: Boolean,
            defaultValue: true,
            description: 'Change photos in video. {italic Used to prevent overriding wanted photos} {bold (default: true)}'
        },
        {
            name: 'disableTTS',
            type: Boolean,
            defaultValue: false,
            description: 'Disable TTS in video. {italic Used to prevent overriding wanted TTS} {bold (default: false)}'
        },
        {
            name: 'bgMusic',
            typeLabel: '{underline path}',
            description: 'Use custom background music.'
        },
        {
            name: 'bgVideo',
            typeLabel: '{underline path}',
            description: 'Use custom background video. {italic If applicable.}'
        },
        {
            name: 'useMock',
            type: Boolean,
            defaultValue: false,
            description: 'Use mock JSON data. {bold (default: false)}'
        },
        {
            name: 'disableSubtitles',
            type: Boolean,
            defaultValue: false,
            description: 'Disable subtitles in video. {bold (default: false)}'
        },
        {
            name: "systemPromptOverride",
            typeLabel: '{underline text}',
            description: "Override system prompt. {italic May not work with all AI types.}"
        },
        { 
            name: 'openAIEndpoint',
            typeLabel: '{underline endpoint}',
            description: 'OpenAI endpoint URL to use. {italic If applicable.}'
        },
        {
            name: 'model',
            typeLabel: '{underline model}',
            description: 'AI model to use. {italic If applicable.}'
        }
    ];

    const sections = [
        {
            header: 'AutoShorts AI video generator (CLI Edition)',
            content: 'Generate AI videos of different types based on a prompt.'
        },
        {
            header: 'Options',
            optionList: mainOptions
        },
        {
            header: 'Advanced Options',
            optionList: advancedOptions,
        },
        {
            header: "API Keys",
            optionList: apiOptions,
        },
        {
            content: 'Created by Shafil Alam.'
        }
    ]

    const usage = commandLineUsage(sections)

    const optionDefinitions = [...mainOptions, ...advancedOptions, ...apiOptions];

    const options = commandLineArgs(optionDefinitions)

    if (options.download) {
        let resPath = options.resPath ?? path.resolve(process.cwd(), 'res');
        if (!options.resPath) {
            // Ask user if they want to use default res path
            const useDefaultRes = await input({ message: `No res path was given via '--resPath' Use default res path? (./res) (y/n) -> ` });
            if (useDefaultRes == "n") {
                resPath = await input({ message: `Enter res path -> ` });
            }
            console.info("[*] Resource path not found (--resPath). Using './res' directory.");
        }
        await download(resPath);
        return;
    }

    if (options.server) {
        await runAPIServer();
        return;
    }

    let aiType: string = options.aiType ?? AIGenType.OllamaAIGen;
    let ttsType: string = options.ttsType ?? VoiceGenType.BuiltinTTS;
    let imageType: string = options.imageType ?? ImageGenType.GoogleScraperImageGen;

    // Check if type is valid
    if (!(aiType in AIGenType)) {
        console.error("Error: Invalid AI type. Exiting...");
        console.info("Valid AI types: " + Object.keys(AIGenType).join(", "));
        return;
    }

    if (!(ttsType in VoiceGenType)) {
        console.error("Error: Invalid TTS type. Exiting...");
        console.info("Valid TTS types: " + Object.keys(VoiceGenType).join(", "));
        return;
    }

    if (!(imageType in ImageGenType)) {
        console.error("Error: Invalid image type. Exiting...");
        console.info("Valid image types: " + Object.keys(ImageGenType).join(", "));
        return;
    }

    let changePhotos = options.changePhotos ?? true;
    let disableTTS = options.disableTTS ?? false;
    let disableSubtitles = options.disableSubtitles ?? false;
    let bgVideo = options.bgVideo ?? null;
    let bgMusic = options.bgMusic ?? null;
    let orientation = options.orientation ?? "vertical";

    let useMock = options.useMock ?? false;

    const tempPath = options.tempPath ?? path.resolve(process.cwd(), 'video_temp');

    const resPath = options.resPath ??  path.resolve(process.cwd(), 'res');

    // Check if res folder before starting
    checkResDir(resPath);

    const userPrompt = options.prompt ?? null;

    const promptOverride = options.systemPromptOverride ?? null;
    const elevenLabsAPIKey = options.elevenlabsAPIKey ?? process.env[VoiceAPIEnv.ElevenLabs] ?? null;
    const pexelsAPIKey = options.pexelsAPIKey ?? process.env[ImageAPIEnv.PexelsAPIKey] ?? null;
    const neetsAPIKey = options.neetsAPIKey ?? process.env[VoiceAPIEnv.NeetsTTS] ?? null;

    const openaiAPIKey = options.openaiAPIKey ?? process.env[AIAPIEnv.OpenAIGen] ?? null;
    const googleaiAPIKey = options.googleaiAPIKey ?? process.env[AIAPIEnv.GoogleAIGen] ?? null;
    const anthropicAPIKey = options.anthropicAPIKey ?? process.env[AIAPIEnv.AnthropicAIGen] ?? null;

    const openAIEndpoint = options.openAIEndpoint ?? OpenAIGen.DEFAULT_ENDPOINT;

    let aiModel = options.model ?? null;

    if (options.help) {
        console.log(usage);
        return;
    }

    // Welcome message
    console.info("Welcome to AutoShorts AI video generator v0.2.0-dev!");

    if (!options.resPath) {
        console.info("[*] Resource path not found (--resPath). Using 'res' directory.");
    }

    // Log current options
    console.log("\n--> Current options:");
    console.info("AI Type: " + aiType);
    console.info("AI Model: " + (aiModel ?? "(using default)"));
    console.info("TTS Type: " + ttsType);
    console.info("Image API Type: " + imageType);
    console.info("Orientation: " + orientation);
    console.info("Temp path: " + tempPath);
    console.info("Res path: " + resPath);
    console.info("Prompt: " + (userPrompt ?? "None (will be asked later)"));

    console.log("\n--> Advanced options:");
    console.info("Background video: " + (bgVideo ?? "Using random"));
    console.info("Background music: " + (bgMusic ?? "Using random"));

    if (options.changePhotos) console.info("Change photos: " + changePhotos);
    if (options.disableTTS) console.info("Disable TTS: " + disableTTS);
    if (options.disableSubtitles) console.info("Disable subtitles: " + disableSubtitles);

    if (promptOverride) console.info("System prompt override: " + promptOverride);
    if (elevenLabsAPIKey) console.info("Eleven Labs API key: present");
    if (pexelsAPIKey) console.info("Pexels API key: present");
    if (neetsAPIKey) console.info("Neets API key: present");
    if (openaiAPIKey) console.info("OpenAI API key: present");
    if (googleaiAPIKey) console.info("Google AI API key: present");
    if (anthropicAPIKey) console.info("Anthropic API key: present");
    if (options.model) console.info("AI override model: " + aiModel);
    if (options.openAIEndpoint && aiType == AIGenType.OpenAIGen) console.info("OpenAI endpoint: " + openAIEndpoint);
    if (options.openAIEndpoint && aiType != AIGenType.OpenAIGen) console.info("OpenAI endpoint: present but not used for current AI type.");

    // Check API keys (checked again later)
    if (ttsType == VoiceGenType.ElevenLabs && !elevenLabsAPIKey) {
        console.error("Error: Eleven Labs API key not found. Exiting...");
        return;
    }

    if (imageType == ImageGenType.PexelsImageGen && !pexelsAPIKey) {
        console.error("Error: Pexels API key not found. Exiting...");
        return;
    }

    if (ttsType == VoiceGenType.NeetsTTS && !neetsAPIKey) {
        console.error("Error: Neets API key not found. Exiting...");
        return;
    }

    // Function to get AI model
    async function getAIModel() {
        let aiModel;
        if (aiType == AIGenType.OllamaAIGen) {
            aiModel = await select({
                message: 'Select Ollama model',
                choices: (await OllamaAIGen.getModels()).map((model: string) => {
                    return { title: model, value: model };
                }),
            });
        } else if (aiType == AIGenType.OpenAIGen) {
            aiModel = await select({
                message: 'Select OpenAI model',
                choices: (await OpenAIGen.getModels(openaiAPIKey, { endpoint: openAIEndpoint })).map((model: string) => {
                    return { title: model, value: model };
                }),
            });
        } else if (aiType == AIGenType.GoogleAIGen) {
            aiModel = await select({
                message: 'Select Google AI model',
                choices: (await GoogleAIGen.getModels()).map((model: string) => {
                    return { title: model, value: model };
                }),
            });
        } else if (aiType == AIGenType.AnthropicAIGen) {
            aiModel = await select({
                message: 'Select Anthropic model',
                choices: (await AnthropicAIGen.getModels()).map((model: string) => {
                    return { title: model, value: model };
                }),
            });
        }
        return aiModel;
    }

    // Advanced options
    const useAdvancedOptionsRep = await input({ message: `Change advanced options? (AI type, other types, models, debug, etc.) (y/n) -> ` });

    const useAdvancedOptions = useAdvancedOptionsRep == "y";

    let usePrev = false;

    if (useAdvancedOptions) {
        // Ask if want to use prev options
        const usePrevOptionsRep = await input({ message: `Use previous advanced options? (default: true) (y/n) -> ` });

        usePrev = usePrevOptionsRep == "y";

        if (usePrevOptionsRep == "y") {
            // TODO: Fix saving path

            try {
                const data = fs.readFileSync('options_autoshorts.json');
                const jsonData = JSON.parse(data.toString());

                console.info("Using advanced previous options:");
                console.info("AI Type: " + jsonData.aiType);
                console.info("TTS Type: " + jsonData.ttsType);
                console.info("Image API Type: " + jsonData.imageType);
                console.info("Orientation: " + jsonData.orientation);
                console.info("Change photos: " + jsonData.changePhotos);
                console.info("Disable TTS: " + jsonData.disableTTS);
                console.info("Disable subtitles: " + jsonData.disableSubtitles);
                console.info("Background video: " + (jsonData.bgVideo ?? "Using random"));
                console.info("Background music: " + (jsonData.bgMusic ?? "Using random"));
                console.info("AI Model: " + jsonData.model);

                aiType = jsonData.aiType;
                ttsType = jsonData.ttsType;
                imageType = jsonData.imageType;
                orientation = jsonData.orientation;
                changePhotos = jsonData.changePhotos;
                disableTTS = jsonData.disableTTS;
                disableSubtitles = jsonData.disableSubtitles;
                bgVideo = jsonData.bgVideo;
                bgMusic = jsonData.bgMusic
                aiModel = jsonData.model;
            } catch (e: any) {
                console.info("[!] Error reading previous options file. Using default options and CLI options.\nError details ->");
                console.error(e.message ?? e.toString());
            }
        }
    }

    if (useAdvancedOptions && !usePrev) {
        aiType = await select({
            message: 'Select AI type',
            choices:
                Object.keys(AIGenType).map((key) => {
                    return { title: key, value: key };
                }),
        });

        imageType = await select({
            message: 'Select image API type',
            choices:
                Object.keys(ImageGenType).map((key) => {
                    return { title: key, value: key };
                }),
        });

        ttsType = await select({
            message: 'Select AI type',
            choices:
                Object.keys(VoiceGenType).map((key) => {
                    return { title: key, value: key };
                }),
        });

        orientation = await select({
            message: 'Select video orientation',
            choices: [
                { name: 'Vertical', value: 'vertical' },
                { name: 'Horizontal', value: 'horizontal' },
            ],
        });

        // Select AI model
        aiModel = await getAIModel();
    
        const changePhotosRep = await input({ message: `Change photos in video? (default: true) (y/n) -> ` });

        const disableTTSRep = await input({ message: `Disable TTS in video? (default: false) (y/n) -> ` });

        const disableSubtitlesRep = await input({ message: `Disable subtitles in video? (default: false) (y/n) -> ` });

        changePhotos = changePhotosRep == "y";
        disableTTS = disableTTSRep == "y";
        disableSubtitles = disableSubtitlesRep == "y";

        // Custom video/bg music
        const useCustomMusicRep = await input({ message: `Use custom video/bg music? (default: false) (y/n) -> ` });

        if (useCustomMusicRep == "y") {

            const vidFiles = fs.readdirSync(path.join(resPath, 'vid'));
            const bgFiles = fs.readdirSync(path.join(resPath, 'music'));

            const answerVid = await select({
                message: 'Select video',
                choices: vidFiles.map((file) => {
                    return { title: file, value: file };
                }),
            });

            const answerBg = await select({
                message: 'Select music',
                choices: bgFiles.map((file) => {
                    return { title: file, value: file };
                }),
            });

            bgVideo = path.join(resPath, 'vid', answerVid);
            bgMusic = path.join(resPath, 'music', answerBg);
        }

        // Print
        console.info("Advanced options:");
        console.info("AI Type: " + aiType);
        console.info("TTS Type: " + ttsType);
        console.info("Image API Type: " + imageType);
        console.info("Image API Type: " + imageType);
        console.info("Change photos: " + changePhotos);
        console.info("Disable TTS: " + disableTTS);
        console.info("Disable subtitles: " + disableSubtitles);
        console.info("Background video: " + (bgVideo ?? "Using random"));
        console.info("Background music: " + (bgMusic ?? "Using random"));
        console.info("AI Model: " + aiModel);

        // Save to file
        const data = {
            aiType: aiType,
            ttsType: ttsType,
            imageType: imageType,
            orientation: orientation,
            changePhotos: changePhotos,
            disableTTS: disableTTS,
            disableSubtitles: disableSubtitles,
            bgVideo: bgVideo,
            bgMusic: bgMusic,
            aiModel: aiModel
        };

        const jsonData = JSON.stringify(data);

        fs.writeFileSync('options_autoshorts.json', jsonData);
        console.info("Options saved to file at: " + path.resolve('options_autoshorts.json'));
    }

    // Get AI model
    if (!aiModel) {
        try {
            aiModel = await getAIModel();
        } catch (e: any) {
            console.info("[*] IMPORTANT: Error getting AI models (check if using correct AI type, if using Ollama - check if running). Error message: " + e.message ?? e.toString());
        }
    }

    let userComment = "";

    if (!useMock && !userPrompt && !options.jsonFile) {
        userComment = await input({ message: `What's your prompt (comment, etc.) ? -> ` });
        console.info("User prompt: " + userComment);
    } else if (useMock && !options.jsonFile) {
        console.info("Using mock data. (No user prompt)");
    } else if (userPrompt && !options.jsonFile) {
        userComment = userPrompt;
        console.info("User prompt (via args): " + userComment);
    } else if (options.jsonFile) {
        console.info(`Using JSON file '${options.jsonFile}' for video generation.`);
    }

    // Generate video based on user comment
    const vidOptions: VideoOptions = {
        tempPath: tempPath,
        resPath: resPath,
        voiceGenType: VoiceGenType[ttsType as keyof typeof VoiceGenType],
        imageGenType: ImageGenType[imageType as keyof typeof ImageGenType],
        orientation: orientation,
        apiKeys: {
            elevenLabsAPIKey: elevenLabsAPIKey ?? process.env.ELEVENLABS_API_KEY,
            pexelsAPIKey: pexelsAPIKey ?? process.env.PEXELS_API_KEY,
            neetsAPIKey: neetsAPIKey ?? process.env.NEETS_API_KEY,
        },
        vidPath: bgVideo,
        bgPath: bgMusic,
        internalOptions: {
            debug: true,
            changePhotos: changePhotos, disableTTS: disableTTS, useMock: useMock, disableSubtitles: disableSubtitles
        },
    };

    // Check if user wants to use json file
    if (options.jsonFile) {
        const jsonFile = options.jsonFile;
        if (!fs.existsSync(jsonFile)) {
            console.error("Error: JSON file not found. Exiting...");
            return;
        }

        const data = fs.readFileSync(jsonFile);
        const jsonData = JSON.parse(data.toString());

        const task = await genVideoWithJson(jsonData, vidOptions);

        task.on('done', (output) => {
            console.info("--> Video generation complete! Video saved at: " + output);
        });

        return;
    }

    // Get AI API key based on type
    let aiAPIKey;
    switch (aiType) {
        case AIGenType.OpenAIGen:
            aiAPIKey = openaiAPIKey;
            break;
        case AIGenType.GoogleAIGen:
            aiAPIKey = googleaiAPIKey;
            break;
        case AIGenType.AnthropicAIGen:
            aiAPIKey = anthropicAPIKey;
            break;
    }

    const aiResponse = await genVideoDataWithAI(
        userComment,
        AIGenType[aiType as keyof typeof AIGenType],
        vidOptions,
        aiAPIKey,
        { model: aiModel, endpoint: openAIEndpoint },
        promptOverride,
    );

    // Ask user if they want to generate video based on AI response
    const genVideoRep = await input({ message: `Generate video based on AI response? (y/n) -> ` });

    if (genVideoRep == "n") {
        console.info("Exiting...");
        return;
    }

    const task = await genVideo(
        aiResponse,
        vidOptions
    );

    task.on('done', (output) => {
        console.info("--> Video generation complete! Video saved at: " + output);
    });
}

cli();
