// Copyright (c) 2024 Shafil Alam

import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import fs from 'fs';
import path from 'path';

import { AIGenType, genVideoDataWithAI, genVideoWithJson, ImageGenType, VoiceGenType } from '.';
import { AnthropicAIGen, GoogleAIGen, OllamaAIGen, OpenAIGen } from './ai';

/**
 * Frontend model for video options
 */
export interface FrontendVideoOptions {
    /** AI Prompt */
    aiPrompt?: string;
    /** AI Type */
    aiType: string;
    /** AI Model */
    aiModel: string;
    /** Voice generation type */
    voiceGenType: string; // TODO: Fix typing
    /** Image generation type */
    imageGenType: string; // TODO: Fix typing
    /** Video orientation */
    orientation: string;
    /** Custom background video path */
    vidPath?: string;
    /** Custom background music path */
    bgPath?: string;
    /** Internal video generation options */
    internalOptions?: FrontendInternalVideoOptions;
    /** API Keys */
    apiKeys?: any; // TODO: Add API keys
}

/**
 * Frontend model for internal video options
 */
export interface FrontendInternalVideoOptions {
    /** Change photos or not */
    changePhotos: boolean;
    /** Disable TTS */
    disableTTS: boolean;
    /** Disable subtitles */
    disableSubtitles: boolean;
    /** Use mock data */
    useMock: boolean;
}

/**
 * Model that contains both FrontendVideoOptions and video data
 */
export interface APIVideoData {
    /** Video options */
    options: FrontendVideoOptions;
    /** Video data */
    data: any; // TODO: Fix typing
}

export async function runAPIServer() {
    console.info('Starting auto-shorts API server...');
    console.info('[*] Note: Running in server mode, not in CLI mode.');

    console.info('[*] Note: Make sure to set the following environment variables (in .env):');
    console.info('SERVER_IP', 'SERVER_PORT', 'SERVER_RES_PATH', 'SERVER_TEMP_PATH');

    const ip = process.env.SERVER_IP;
    const portStr = process.env.SERVER_PORT;

    if (!ip || !portStr) {
        console.error('Error: IP and PORT are required!');
        return;
    }

    // Check if valid port
    if (isNaN(parseInt(portStr))) {
        console.error('Error: Invalid port number!');
        return;
    }

    const port = parseInt(portStr);

    console.info(`-> Using IP: ${ip}, PORT: ${port}`);

    // Check for res path and temp path; if not set, use default
    let resPath = process.env.SERVER_RES_PATH;
    let tempPath = process.env.SERVER_TEMP_PATH;

    const defaultResPath = 'res';
    const defaultTempPath = 'video_temp';

    if (!resPath) {
        console.info('Warning: RES_PATH is not set! Using default path: ' + defaultResPath);
    } else {
        console.info('-> Using RES_PATH: ' + resPath);
    }

    if (!tempPath) {
        console.info('Warning: TEMP_PATH is not set! Using default path: ' + defaultTempPath);
    } else {
        console.info('-> Using TEMP_PATH: ' + tempPath);
    }

    resPath = resPath ?? defaultResPath;
    tempPath = tempPath ?? defaultTempPath;

    // Check if res and temp path exists
    if (!fs.existsSync(resPath)) {
        console.error('Error: RES_PATH does not exist!');
        console.info('--> Use npx auto-shorts --download [resPath] to download resources.');
        return;
    }

    if (!fs.existsSync(tempPath)) {
        console.error('Error: TEMP_PATH does not exist!');
        return;
    }

    // Start the server
    const app = express();

    // TODO: Make CORS only on localhost, 127.0.0.1
    app.use(cors());

    app.use(express.json()); // to support JSON-encoded bodies

    app.use((req, res, next) => {
        console.info(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
        next();
    });

    app.get('/', (req, res) => {
        res.send('auto-shorts API server is running!');
    });

    const root = '/api/v1';

    // TODO: Cache API responses and test output speed for production scale

    /**
     * Generate video data with AI
     * POST /generateAIJSON
     * Request body: FrontendVideoData with AI prompt
     * Response: JSON data
     */
    app.post(`${root}/generateAIJSON`, async (req, res) => {
        try {
            // Generate video with JSON data
            // Get JSON data from request body
            const json = req.body;

            // Data must be FrontendVideoData type
            if (!json) {
                res.status(400).json({
                    error: 'Invalid JSON data!'
                });
                return;
            }

            const data: FrontendVideoOptions = json as FrontendVideoOptions;

            const task = await genVideoDataWithAI(
                data.aiPrompt ?? "",
                data.aiType as AIGenType,
                {
                    tempPath: tempPath,
                    resPath: resPath,
                    voiceGenType: data.voiceGenType as VoiceGenType,
                    imageGenType: data.imageGenType as ImageGenType,
                    orientation: data.orientation as 'vertical' | 'horizontal',
                    vidPath: data.vidPath,
                    bgPath: data.bgPath,
                    // apiKeys: data.apiKeys, // TODO: Add API keys
                    internalOptions: {
                        debug: true,
                        changePhotos: data.internalOptions?.changePhotos ?? true,
                        disableTTS: data.internalOptions?.disableTTS ?? false,
                        disableSubtitles: data.internalOptions?.disableSubtitles ?? false,
                        useMock: data.internalOptions?.useMock ?? false
                    }
                },
            );

            res.json({
                result: task
            });

        } catch (err: any) {
            res.status(400).json({
                error: "Internal server error: " + (err.message ?? err.toString())
            });
        }
    });

    /**
     * Generate video from JSON data
     * POST /generateVideo
     * Request body: JSON data with both video options and video data (APIVideoData type)
     * Response: Video file path
     */
    app.post(`${root}/generateVideo`, async (req, res) => {
        try {
            // Generate video with JSON data
            // Get JSON data from request body
            const json = req.body;

            // Use Server-Sent Events (SSE) to send logs to the client
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Data must be VideoData type
            if (!json) {
                res.write('data: ' + JSON.stringify({ error: 'Invalid JSON data!' }) + '\n\n');
                res.end();
                console.info('Closing live session due to Invalid JSON data!');
                return;
            }

            const data: APIVideoData = json as APIVideoData;
            const options = data.options;

            const task = await genVideoWithJson(
                data.data,
                {
                    tempPath: 'video_temp',
                    resPath: 'res',
                    voiceGenType: options.voiceGenType as VoiceGenType,
                    imageGenType: options.imageGenType as ImageGenType,
                    orientation: options.orientation as 'vertical' | 'horizontal',
                    vidPath: options.vidPath,
                    bgPath: options.bgPath,
                    // apiKeys: data.apiKeys, // TODO: Add API keys
                    internalOptions: {
                        debug: false,
                        changePhotos: options.internalOptions?.changePhotos ?? true,
                        disableTTS: options.internalOptions?.disableTTS ?? false,
                        disableSubtitles: options.internalOptions?.disableSubtitles ?? false,
                        useMock: options.internalOptions?.useMock ?? false
                    }
                },
            );

            console.info("Stating live log stream to client...");

            task.on('log', (log: string) => {
                // Send log to client in JSON
                res.write(`data: ${JSON.stringify({ log: log })}\n\n`);
            });

            task.on('done', (videoPath: string) => {
                // Send video path to client in JSON
                // Get folder that contains video file (only folder path, not the full path)
                const folderPath = path.basename(path.dirname(videoPath));
                res.write(`data: ${JSON.stringify({ videoId: folderPath })}\n\n`);
                // Close the response
                res.end();
            });

            res.on('close', () => {
                // Close the response
                console.info("Live log stream closed.");
                res.end();
            });

        } catch (err: any) {
            res.write('data: ' + JSON.stringify({ error: 'Internal server error: ' + (err.message ?? err.toString()) }) + '\n\n');
            res.end();
            console.info('Closing live session due to internal error!');
        }
    });

    /**
     * Get video stream from video file path
     * GET /getVideo
     * Response: Video stream
     * Example: /getVideo?path=[videoPath]
     */
    app.get(`${root}/getVideo`, (req, res) => {
        try {
            // Get video path
            const videoId = req.query.id as string;

            // Check if empty
            if (!videoId) {
                res.status(400).json({
                    error: 'Video ID is required! (?id=[video id])'
                });
                return;
            }

            const videoPath = path.join(tempPath, videoId, 'video.mp4');

            // Check if video path exists
            if (!fs.existsSync(videoPath)) {
                res.status(400).json({
                    error: 'Video does not exist! (' + videoPath + ')'
                });
                return;
            }

            // Get video stream
            const stat = fs.statSync(videoPath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(videoPath, { start, end });
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4',
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4',
                };
                res.writeHead(200, head);
                fs.createReadStream(videoPath).pipe(res);
            }

        } catch (err: any) {
            res.status(400).json({
                error: "Internal server error: " + (err.message ?? err.toString())
            });
        }
    });

    /**
     * Get all AI types based on AIGenType
     * GET /types/ai
     * Response: AI types
     */
    app.get(`${root}/types/ai`, (req, res) => {
        res.json({
            types: Object.keys(AIGenType)
        });
    });

    /**
     * Get all AI models based on AIGenType
     * GET /types/ai/models
     * Response: AI models
     * Example: /types/ai/models?type=OpenAIGen
     * Response: { models: ['gpt-4o', 'gpt-4o-mini', 'o1-mini'] }
     */
    app.get(`${root}/types/ai/models`, async (req, res) => {
        try {
            // Get AI type
            const aiTypeStr = req.query.type as string;

            // Check if empty
            if (!aiTypeStr) {
                res.status(400).json({
                    error: 'AI type is required! (?type=[AI type])'
                });
                return;
            }

            // Check if AI type is valid
            if (!Object.keys(AIGenType).includes(aiTypeStr)) {
                res.status(400).json({
                    error: `Invalid AI type! (type=${aiTypeStr})`
                });
                return;
            }

            // Get AI type enum
            const aiType = AIGenType[aiTypeStr as keyof typeof AIGenType];

            // Get AI models based on AI type
            let models: string[] = [];
            let apiKey;

            // Function to error if API key is not provided from env
            const errorIfNoAPIKey = () => {
                res.status(400).json({
                    error: `API key is required for ${aiType}!`
                });
                return;
            }

            switch (aiType) {
                case AIGenType.OllamaAIGen:
                    models = await OllamaAIGen.getModels();
                    break;
                case AIGenType.OpenAIGen:
                    apiKey = process.env[AIGenType.OpenAIGen];
                    if (!apiKey) return errorIfNoAPIKey();
                    models = await OpenAIGen.getModels();
                    break;
                case AIGenType.GoogleAIGen:
                    apiKey = process.env[AIGenType.GoogleAIGen];
                    if (!apiKey) return errorIfNoAPIKey();
                    models = await GoogleAIGen.getModels();
                    break;
                case AIGenType.AnthropicAIGen:
                    apiKey = process.env[AIGenType.AnthropicAIGen];
                    if (!apiKey) return errorIfNoAPIKey();
                    models = await AnthropicAIGen.getModels();
                    break;
            }

            res.json({
                models
            });
        } catch (err: any) {
            res.status(400).json({
                error: "Internal server error: " + (err.message ?? err.toString())
            });
        }
    });

    /**
     * Get all background video from resources folder
     * GET /types/backgrounds
     * Response: Background videos
     * Example: /types/backgrounds?resPath=res
     * Response: { backgrounds: ['background1.mp4', 'background2.mp4'] }
     */
    app.get(`${root}/types/backgrounds`, (req, res) => {
        try {
            // Get resource path
            let resPath = req.query.resPath as string;

            // Check if empty
            resPath = resPath ? resPath : 'res';

            // Get all background videos
            const backgrounds = fs.readdirSync(path.join(resPath, 'vid'));

            res.json({
                videos: backgrounds
            });
        } catch (err: any) {
            res.status(400).json({
                error: "Internal server error: " + (err.message ?? err.toString())
            });
        }
    });

    /**
     * Get all background music from resources folder
     * GET /types/bgaudio
     * Response: Background audio
     * Example: /types/bgaudio?resPath=res
     * Response: { bgaudio: ['music1.mp3', 'music2.mp3'] }
     */
    app.get(`${root}/types/bgaudio`, (req, res) => {
        try {
            // Get resource path
            let resPath = req.query.resPath as string;

            // Check if empty
            resPath = resPath ? resPath : 'res';

            // Get all background audio
            const bgaudio = fs.readdirSync(path.join(resPath, 'music'));

            res.json({
                audios: bgaudio
            });
        } catch (err: any) {
            res.status(400).json({
                error: "Internal server error: " + (err.message ?? err.toString())
            });
        }
    });

    app.listen(port, ip, () => {
        console.info(`Server running at http://${ip}:${port}/`);
    });

    return;
}
