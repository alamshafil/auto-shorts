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
            name: 'noBgVideo',
            type: Boolean,
            defaultValue: false,
            description: 'Disable background video. {bold (default: false)}'
        },
        {
            name: 'noBgMusic',
            type: Boolean,
            defaultValue: false,
            description: 'Disable background music. {bold (default: false)}'
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

    const ttsOptions = [
        {
            name: 'ttsMaleVoice',
            typeLabel: '{underline voice}',
            description: 'TTS male voice to use. {italic If applicable.}'
        },
        {
            name: 'ttsFemaleVoice',
            typeLabel: '{underline voice}',
            description: 'TTS female voice to use {italic If applicable.}'
        },
        {
            name: 'ttsVoiceModel',
            typeLabel: '{underline model}',
            description: 'TTS voice model to use. {italic If applicable.}'
        }
    ];

    const imgOptions = [
        {
            name: 'imgAIModel',
            typeLabel: '{underline model}',
            description: 'AI model to use for image generation. {italic If applicable.}'
        },
        {
            name: 'imgAIPrompt',
            typeLabel: '{underline prompt}',
            description: 'AI suffix prompt to use for image generation. {italic If applicable.}'
        }
    ]

    const subOptions = [
        {
            name: 'subtitleLen',
            type: Number,
            description: 'Subtitle token length override.'
        },
        {
            name: 'subFontName',
            typeLabel: '{underline font}',
            description: 'Subtitle font name override.'
        },
        {
            name: 'subFontSize',
            type: Number,
            description: 'Subtitle font size override.'
        },
        {
            name: 'subFontColor',
            typeLabel: '{underline color}',
            description: 'Subtitle font color override.'
        },
        {
            name: 'subStrokeColor',
            typeLabel: '{underline color}',
            description: 'Subtitle stroke color override.'
        },
        {
            name: 'subStrokeWidth',
            type: Number,
            description: 'Subtitle stroke width override'
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
            header: 'TTS Options',
            optionList: ttsOptions
        },
        {
            header: 'Image Options',
            optionList: imgOptions
        },
        {
            header: 'Subtitle Options',
            optionList: subOptions
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

    const optionDefinitions = [...mainOptions, ...advancedOptions, ...subOptions, ...imgOptions, ...ttsOptions, ...apiOptions];

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
    let imageType: string = options.imageType ?? ImageGenType.GoogleScraper;

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

    // Advanced options
    let changePhotos = options.changePhotos ?? true;
    let disableTTS = options.disableTTS ?? false;
    let disableSubtitles = options.disableSubtitles ?? false;
    let bgVideo = options.bgVideo ?? null;
    let bgMusic = options.bgMusic ?? null;
    let orientation = options.orientation ?? "vertical";
    let noBgVideo = options.noBgVideo ?? false;
    let noBgMusic = options.noBgMusic ?? false;

    // TTS options
    let ttsMaleVoice = options.ttsMaleVoice ?? null;
    let ttsFemaleVoice = options.ttsFemaleVoice ?? null;
    let ttsVoiceModel = options.ttsVoiceModel ?? null;

    // AI Image options
    let imgAIModel = options.imgAIModel ?? null;
    let imgAIPrompt = options.imgAIPrompt ?? null;

    // Subtitle options
    let subtitleLen = options.subtitleLen ?? null;
    let subFontName = options.subFontName ?? null;
    let subFontSize = options.subFontSize ?? null;
    let subFontColor = options.subFontColor ?? null;
    let subStrokeColor = options.subStrokeColor ?? null;
    let subStrokeWidth = options.subStrokeWidth ?? null;

    const useMock = options.useMock ?? false;

    const tempPath = options.tempPath ?? path.resolve(process.cwd(), 'video_temp');

    const resPath = options.resPath ?? path.resolve(process.cwd(), 'res');

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

    console.log("\n--> Image AI options:");
    console.info("Image AI model: " + (imgAIModel ?? "Default"));
    console.info("Image AI prompt: " + (imgAIPrompt ?? "Default"));

    console.log("\n--> TTS options:");
    console.info("Male voice: " + (ttsMaleVoice ?? "Default"));
    console.info("Female voice: " + (ttsFemaleVoice ?? "Default"));
    console.info("Voice model: " + (ttsVoiceModel ?? "Default"));

    console.log("\n--> Subtitle options:");
    console.info("Subtitle length: " + (subtitleLen ?? "Default"));
    console.info("Subtitle font name: " + (subFontName ?? "Default"));
    console.info("Subtitle font size: " + (subFontSize ?? "Default"));
    console.info("Subtitle font color: " + (subFontColor ?? "Default"));
    console.info("Subtitle stroke color: " + (subStrokeColor ?? "Default"));
    console.info("Subtitle stroke width: " + (subStrokeWidth ?? "Default"));

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

    if (options.noBgVideo) console.info("No background video enabled!");
    if (options.noBgMusic) console.info("No background music enabled!");

    // Check API keys (checked again later)
    if (ttsType == VoiceGenType.ElevenLabs && !elevenLabsAPIKey) {
        console.error("Error: Eleven Labs API key not found. Exiting...");
        return;
    }

    if (imageType == ImageGenType.GoogleScraper && !pexelsAPIKey) {
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

                // Log previous advanced options
                console.info("--> Using advanced previous options:");
                console.info("AI Type: " + jsonData.aiType);
                console.info("TTS Type: " + jsonData.ttsType);
                console.info("Image API Type: " + jsonData.imageType);
                console.info("Orientation: " + jsonData.orientation);
                console.info("Change photos: " + jsonData.changePhotos);
                console.info("Disable TTS: " + jsonData.disableTTS);
                console.info("Disable subtitles: " + jsonData.disableSubtitles);
                console.info("Background video: " + (jsonData.bgVideo ?? "Using random"));
                console.info("Background music: " + (jsonData.bgMusic ?? "Using random"));
                console.info("Use background video: " + !jsonData.noBgVideo);
                console.info("Use background music: " + !jsonData.noBgMusic);
                console.info("AI Model: " + jsonData.model);

                // Log previous TTS options
                console.info("--> Using previous TTS options:");
                console.info("Male voice: " + (jsonData.ttsMaleVoice ?? "Default"));
                console.info("Female voice: " + (jsonData.ttsFemaleVoice ?? "Default"));
                console.info("Voice model: " + (jsonData.ttsVoiceModel ?? "Default"));

                // Log previous image options
                console.info("--> Using previous image options:");
                console.info("Image AI model: " + (jsonData.imgAIModel ?? "Default"));
                console.info("Image AI prompt: " + (jsonData.imgAIPrompt ?? "Default"));

                // Log previous subtitle options
                console.info("--> Using previous subtitles options:");
                console.info("Subtitle length: " + (jsonData.subtitleLen ?? "Default"));
                console.info("Subtitle font name: " + (jsonData.subFontName ?? "Default"));
                console.info("Subtitle font size: " + (jsonData.subFontSize ?? "Default"));
                console.info("Subtitle font color: " + (jsonData.subFontColor ?? "Default"));
                console.info("Subtitle stroke color: " + (jsonData.subStrokeColor ?? "Default"));
                console.info("Subtitle stroke width: " + (jsonData.subStrokeWidth ?? "Default"));

                // Set previous options
                aiType = jsonData.aiType;
                ttsType = jsonData.ttsType;
                imageType = jsonData.imageType;
                orientation = jsonData.orientation;
                changePhotos = jsonData.changePhotos;
                disableTTS = jsonData.disableTTS;
                disableSubtitles = jsonData.disableSubtitles;
                bgVideo = jsonData.bgVideo;
                bgMusic = jsonData.bgMusic
                noBgVideo = jsonData.noBgVideo;
                noBgMusic = jsonData.noBgMusic;
                aiModel = jsonData.model;

                // Set previous TTS options
                ttsMaleVoice = jsonData.ttsMaleVoice;
                ttsFemaleVoice = jsonData.ttsFemaleVoice;
                ttsVoiceModel = jsonData.ttsVoiceModel;

                // Set previous image options
                imgAIModel = jsonData.imgAIModel;
                imgAIPrompt = jsonData.imgAIPrompt;

                // Set previous subtitle options
                subtitleLen = jsonData.subtitleLen;
                subFontName = jsonData.subFontName;
                subFontSize = jsonData.subFontSize;
                subFontColor = jsonData.subFontColor;
                subStrokeColor = jsonData.subStrokeColor;
                subStrokeWidth = jsonData.subStrokeWidth;
            } catch (e: any) {
                console.info("[!] Error reading previous options file. Using default options and CLI options.\nError details ->");
                console.error(e.message ?? e.toString());
            }
        }
    }

    if (useAdvancedOptions && !usePrev) {
        // Ask for API types

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

        // Ask for advanced options

        const changePhotosRep = await input({ message: `Change photos in video? (default: true) (y/n) -> ` });

        const disableTTSRep = await input({ message: `Disable TTS in video? (default: false) (y/n) -> ` });

        const disableSubtitlesRep = await input({ message: `Disable subtitles in video? (default: false) (y/n) -> ` });

        changePhotos = changePhotosRep == "y" || changePhotosRep == "";
        disableTTS = disableTTSRep == "y";
        disableSubtitles = disableSubtitlesRep == "y";

        // Ask if user wants to use background video and music
        const useBgVideoRep = await input({ message: `Use background video? (default: true) (y/n) -> ` });
        const useBgMusicRep = await input({ message: `Use background music? (default: true) (y/n) -> ` });
        noBgVideo = useBgVideoRep == "n";
        noBgMusic = useBgMusicRep == "n";

        // Custom video/bg music (only if user wants to use bg video and music)
        if (!noBgVideo || !noBgMusic) {
            const useCustomMusicRep = await input({ message: `Use custom video/bg music? (default: false) (y/n) -> ` });

            if (useCustomMusicRep == "y") {
                if (!noBgVideo) {
                    const vidFiles = fs.readdirSync(path.join(resPath, 'vid'));
                    const answerVid = await select({
                        message: 'Select video',
                        choices: vidFiles.map((file) => {
                            return { title: file, value: file };
                        }),
                    });
                    bgVideo = path.join(resPath, 'vid', answerVid);
                }

                if (!noBgMusic) {
                    const bgFiles = fs.readdirSync(path.join(resPath, 'music'));
                    const answerBg = await select({
                        message: 'Select music',
                        choices: bgFiles.map((file) => {
                            return { title: file, value: file };
                        }),
                    });
                    bgMusic = path.join(resPath, 'music', answerBg);
                }
            }
        }

        // Ask for TTS options
        console.info("[*] Asking for TTS options (leave empty for default):");

        const ttsMaleVoiceRep = await input({ message: `TTS Male voice model? -> ` });
        const ttsFemaleVoiceRep = await input({ message: `TTS Female voice model? -> ` });
        const ttsVoiceModelRep = await input({ message: `TTS voice model? -> ` });

        ttsMaleVoice = ttsMaleVoiceRep !== "" ? ttsMaleVoiceRep : ttsMaleVoice;
        ttsFemaleVoice = ttsFemaleVoiceRep !== "" ? ttsFemaleVoiceRep : ttsFemaleVoice;
        ttsVoiceModel = ttsVoiceModelRep !== "" ? ttsVoiceModelRep : ttsVoiceModel;

        // Ask for image AI options
        console.info("[*] Asking for image AI options (leave empty for default):");

        const imgAIModelRep = await input({ message: `Image AI model? -> ` });
        const imgAIPromptRep = await input({ message: `Image AI prompt? -> ` });

        imgAIModel = imgAIModelRep !== "" ? imgAIModelRep : imgAIModel;
        imgAIPrompt = imgAIPromptRep !== "" ? imgAIPromptRep : imgAIPrompt;

        // Ask for subtitle options (if empty then keep null or current value)
        console.info("[*] Asking for subtitle options (leave empty for default):");

        const subtitleLenRep = await input({ message: `Subtitle token length override? -> ` });
        const subFontNameRep = await input({ message: `Subtitle font name override? -> ` });
        const subFontSizeRep = await input({ message: `Subtitle font size override? -> ` });
        const subFontColorRep = await input({ message: `Subtitle font color override? (hex with #) -> ` });
        const subStrokeColorRep = await input({ message: `Subtitle stroke color override? (hex with #) -> ` });
        const subStrokeWidthRep = await input({ message: `Subtitle stroke width override? -> ` });

        subtitleLen = subtitleLenRep !== "" ? subtitleLenRep : subtitleLen;
        subFontName = subFontNameRep !== "" ? subFontNameRep : subFontName;
        subFontSize = subFontSizeRep !== "" ? subFontSizeRep : subFontSize;
        subFontColor = subFontColorRep !== "" ? subFontColorRep : subFontColor;
        subStrokeColor = subStrokeColorRep !== "" ? subStrokeColorRep : subStrokeColor;
        subStrokeWidth = subStrokeWidthRep !== "" ? subStrokeWidthRep : subStrokeWidth;

        // Print advanced options
        console.info("--> Advanced options:");
        console.info("AI Type: " + aiType);
        console.info("TTS Type: " + ttsType);
        console.info("Image API Type: " + imageType);
        console.info("Image API Type: " + imageType);
        console.info("Change photos: " + changePhotos);
        console.info("Disable TTS: " + disableTTS);
        console.info("Disable subtitles: " + disableSubtitles);
        console.info("Background video: " + (bgVideo ?? "Using random"));
        console.info("Background music: " + (bgMusic ?? "Using random"));
        console.info("Use background video: " + !noBgVideo);
        console.info("Use background music: " + !noBgMusic);
        console.info("AI Model: " + aiModel);

        // Print TTS options
        console.info("--> TTS options:");
        console.info("Male voice: " + (ttsMaleVoice ?? "Default"));
        console.info("Female voice: " + (ttsFemaleVoice ?? "Default"));
        console.info("Voice model: " + (ttsVoiceModel ?? "Default"));

        // Print image AI options
        console.info("--> Image AI options:");
        console.info("Image AI model: " + (imgAIModel ?? "Default"));
        console.info("Image AI prompt: " + (imgAIPrompt ?? "Default"));

        // Print subtitle options
        console.info("--> Subtitle options:");
        console.info("Subtitle length: " + (subtitleLen ?? "Default"));
        console.info("Subtitle font name: " + (subFontName ?? "Default"));
        console.info("Subtitle font size: " + (subFontSize ?? "Default"));
        console.info("Subtitle font color: " + (subFontColor ?? "Default"));
        console.info("Subtitle stroke color: " + (subStrokeColor ?? "Default"));

        // Save to file
        const data = {
            // Main options
            aiType: aiType,
            ttsType: ttsType,
            imageType: imageType,
            orientation: orientation,
            changePhotos: changePhotos,
            disableTTS: disableTTS,
            disableSubtitles: disableSubtitles,
            bgVideo: bgVideo,
            bgMusic: bgMusic,
            noBgVideo: noBgVideo,
            noBgMusic: noBgMusic,
            aiModel: aiModel,
            // TTS options
            ttsMaleVoice: ttsMaleVoice,
            ttsFemaleVoice: ttsFemaleVoice,
            ttsVoiceModel: ttsVoiceModel,
            // Image options
            imgAIModel: imgAIModel,
            imgAIPrompt: imgAIPrompt,
            // Subtitle options
            subtitleLen: subtitleLen,
            subFontName: subFontName,
            subFontSize: subFontSize,
            subFontColor: subFontColor,
            subStrokeColor: subStrokeColor,
            subStrokeWidth: subStrokeWidth
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
            console.info("[*] IMPORTANT: Error getting AI models (check if using correct AI type, if using Ollama - check if running). Error message: " + e.message);
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
            elevenLabsAPIKey: elevenLabsAPIKey ?? process.env[VoiceAPIEnv.ElevenLabs],
            pexelsAPIKey: pexelsAPIKey ?? process.env[ImageAPIEnv.PexelsAPIKey],
            neetsAPIKey: neetsAPIKey ?? process.env[VoiceAPIEnv.NeetsTTS],
        },
        vidPath: bgVideo,
        bgPath: bgMusic,
        useBgMusic: !noBgMusic,
        useBgVideo: !noBgVideo,
        subtitleOptions: {
            maxLen: subtitleLen, fontName: subFontName, fontSize: subFontSize,
            fontColor: subFontColor, strokeColor: subStrokeColor, strokeWidth: subStrokeWidth
        },
        imageOptions: {
            modelName: imgAIModel, suffixPrompt: imgAIPrompt
        },
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
