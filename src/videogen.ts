// Copyright (c) 2024 Shafil Alam

import * as tts from "./tts";
import * as img from "./image";
import fs from "fs";
import path from "path";
import { EventEmitter } from "events";
import fluent_ffmpeg from 'fluent-ffmpeg';

import { TopicVideoData } from "./types/topicVid";
import { RankVideoData } from "./types/rankVid";
import { RatherVideoData } from "./types/ratherVid";
import { QuizVideoData } from "./types/quizVid";
import { MessageVideoData } from "./types/msgVid";
import { WhisperSubtitles } from "./subtitles";

/**
 * Video data types
 */
export type VideoDataType = TopicVideoData | RankVideoData | RatherVideoData | QuizVideoData | MessageVideoData;

/**
 * Video generation types
 */
export enum VideoGenType {
    /** Message video */
    TextMessageVideo = "message",
    /** Topic video */
    TopicVideo = "topic",
    /** Rank video */
    RankVideo = "rank",
    /** Rather video */
    RatherVideo = "rather",
    /** Quiz video */
    QuizVideo = "quiz",
}

/**
 * Video generation options
 * @example
 * ```
 * {
 * tempPath: "temp",
 * resPath: "res",
 * voiceGenType: VoiceGenType.ElevenLabsVoice,
 * imageGenType: ImageGenType.PexelsImageGen,
 * }
 * ```
 */
export interface VideoOptions {
    /** Temporary path to save files */
    tempPath: string;
    /** Resource path */
    resPath: string;
    /** Voice generation type */
    voiceGenType: tts.VoiceGenType;
    /** Image generation type */
    imageGenType: img.ImageGenType;
    /** Video orientation */
    orientation: "vertical" | "horizontal";
    /** Custom background video path */
    vidPath?: string;
    /** Custom background music path */
    bgPath?: string;
    /** Use background music or not */
    useBgMusic?: boolean;
    /** Use background video or not */
    useBgVideo?: boolean;
    /** Internal video generation options */
    internalOptions?: InternalVideoOptions;
    /** Subtitle generation options */
    subtitleOptions?: SubtitleOptions;
    /** API Keys */
    apiKeys?: APIKeys;
}

/**
 * API keys
 */
export interface APIKeys {
    /** ElevenLabs API key */
    elevenLabsAPIKey?: string;
    /** Pexels API key */
    pexelsAPIKey?: string;
    /** Neets API key */
    neetsAPIKey?: string;
}

/**
 * Internal video generation options
 */
export interface InternalVideoOptions {
    /** 
     * Debug logging. 
     * If set to true, all output will be logged. 
     * If set to false, use event emitter 'log' to get output 
     */
    debug: boolean;
    /** Change photos or not */
    changePhotos: boolean;
    /** Disable TTS */
    disableTTS: boolean;
    /** Disable subtitles */
    disableSubtitles: boolean;
    /** Use mock data */
    useMock: boolean;
    /** Eleven Labs options */
    elevenLabsOptions?: tts.ElevenLabsOptions;
    /** Neets TTS options */
    neetsTTSOptions?: tts.NeetsTTSOptions;
}

/**
 * Subtitle generation options
 */
export interface SubtitleOptions {
    /** Maximum length for token */
    maxLen?: number;
    /** Font name */
    fontName?: string;
    /** Font size */
    fontSize?: number;
    /** Font color */
    fontColor?: string;
    /** Stroke color */
    strokeColor?: string;
    /** Stroke width */
    strokeWidth?: number;
}

export const DEFAULT_INTERNAL_VIDEO_OPTIONS: InternalVideoOptions = {
    debug: false,
    changePhotos: true,
    disableTTS: false,
    disableSubtitles: false,
    useMock: false,
};

/**
 * Base class for video generation
 * @abstract
 */
export class VideoGen {
    // Properties

    /** Event Emitter */
    public emitter: EventEmitter = new EventEmitter();

    /** JSON data */
    protected jsonData: any;
    /** Temporary path to save files */
    public tempPath: string;
    /** Resource path */
    protected resPath: string;
    /** Voice generation type */
    protected voiceGenType: tts.VoiceGenType;
    /** Image generation type */
    protected imageGenType: img.ImageGenType;
    /** Video orientation */
    protected orientation: "vertical" | "horizontal";
    /** Custom background video path */
    protected vidPath?: string;
    /** Custom background music path */
    protected bgPath?: string;
    /** Use background music or not */
    protected useBgMusic?: boolean;
    /** Use background video or not */
    protected useBgVideo?: boolean;
    /** Internal video generation options */
    protected internalOptions: InternalVideoOptions = DEFAULT_INTERNAL_VIDEO_OPTIONS;
    /** Subtitle generation options */
    protected subtitleOptions?: SubtitleOptions;
    /** API Keys */
    protected apiKeys?: APIKeys;

    constructor(options: VideoOptions, jsonData: any) {
        // Initialize properties
        this.tempPath = options.tempPath;
        this.resPath = options.resPath;
        this.voiceGenType = options.voiceGenType;
        this.imageGenType = options.imageGenType;
        this.orientation = options.orientation;
        this.apiKeys = options.apiKeys;
        this.vidPath = options.vidPath;
        this.bgPath = options.bgPath;
        this.useBgMusic = options.useBgMusic;
        this.useBgVideo = options.useBgVideo;
        this.internalOptions = options.internalOptions ?? DEFAULT_INTERNAL_VIDEO_OPTIONS;
        this.subtitleOptions = options.subtitleOptions;
        this.jsonData = jsonData;
    }

    /**
     * Function to convert orientation to resolution (1920x1080 for horizontal, 1080x1920 for vertical)
     * 
     * @returns Resolution as a tuple of numbers (width, height)
     */
    getResolution() {
        let res: [number, number];
        if (this.orientation === "horizontal") {
            res = [1920, 1080];
            return res;
        } else if (this.orientation === "vertical") {
            res = [1080, 1920];
            return res;
        } else {
            throw new Error("Invalid orientation: " + this.orientation);
        }
    }

    /**
     * Log messages if debug is enabled
     * 
     * Also emits a 'log' event with the message
     */
    public log(this: VideoGen, message: string) {
        if (this.internalOptions.debug) {
            console.info(message);
            return;
        }

        this.emitter.emit('log', message);
    }

    /** 
     * Generate voice using the specified options
     * @param options Voice generation options
     * @throws Error if invalid voice generation type
     */
    async generateVoice(options: tts.VoiceGenOptions) {
        if (this.internalOptions.elevenLabsOptions) {
            options.elevenLabsOptions = this.internalOptions.elevenLabsOptions;
        }

        if (this.internalOptions.neetsTTSOptions) {
            options.neetsTTSOptions = this.internalOptions.neetsTTSOptions;
        }

        if (!this.internalOptions.disableTTS) {
            switch (this.voiceGenType) {
                case tts.VoiceGenType.ElevenLabs:
                    return await tts.ElevenLabsVoice.generateVoice(this, options, this.apiKeys?.elevenLabsAPIKey);
                case tts.VoiceGenType.NeetsTTS:
                    return await tts.NeetsTTSVoice.generateVoice(this, options, this.apiKeys?.neetsAPIKey);
                case tts.VoiceGenType.BuiltinTTS:
                    return await tts.BuiltinTTSVoice.generateVoice(this, options);
                default:
                    throw new Error("Invalid voice generation type");
            }
        } else {
            return;
        }
    }

    /**
     * Generate images using the specified image generation type
     * @param images List of image queries
     * @param filePrefix File prefix for images
     * @returns List of image paths
     * @throws Error if invalid image generation type
     */
    async generateImages(images: string[], filePrefix?: string) : Promise<string[]> {
        const genImages = async (images: string[]) : Promise<string[]> => {
            switch (this.imageGenType) {
                case img.ImageGenType.PexelsImageGen:
                    return await img.PexelsImageGen.generateImages(this, images, this.tempPath, this.internalOptions.changePhotos, this.apiKeys?.pexelsAPIKey, filePrefix);
                case img.ImageGenType.GoogleScraperImageGen:
                    return await img.GoogleScraperImageGen.generateImages(this, images, this.tempPath, this.internalOptions.changePhotos, filePrefix);
                default:
                    throw new Error("Invalid image generation type");
            }
        }

        let imgs: string[] = [];

        if (this.internalOptions.changePhotos) {
            imgs = await genImages(images);        
        } else {
            for (const [index, _] of images.entries()) {
                const img_path = path.join(this.tempPath, `image-${filePrefix ?? index}.png`);
                imgs.push(img_path);
            }
        }

        return imgs;
    }

    async generateSubtitles(audio16kFile: string, srtFile: string, maxLen: number) {
        if (!this.internalOptions.disableSubtitles) {
            return await WhisperSubtitles.transcribeSrt(this, audio16kFile, maxLen, srtFile, this.resPath);
        }
    }

    /**
     * Check if the temporary path exists
     * If it does not exist, create a new one
     * 
     * @throws Error if temp directory cannot be created
     */
    checkTempPath() {
        this.log('Starting video generation...');

        const id = (Math.random() + 1).toString(36).substring(7); // Note: This is not a secure way to generate a random ID
        const uniqueFolder = path.join(this.tempPath, id);

        if (!fs.existsSync(uniqueFolder)) {
            fs.mkdirSync(uniqueFolder);
            this.log(`Temp directory ${uniqueFolder} created successfully!`);
        } else {
            this.log(`Temp directory ${uniqueFolder} already exists! Deleting and creating a new one...`);
            fs.rmSync(uniqueFolder, { recursive: true, force: true });
            fs.mkdirSync(uniqueFolder);
        }

        this.tempPath = uniqueFolder;
    }

    /** 
     * Combine voice files into a single audio file
     * @param voiceFiles List of voice files
     * @param filename Output filename
     * @returns Promise that resolves when the audio file is created
     * @throws Error if ffmpeg command fails
     */
    async combineVoiceFiles(voiceFiles: string[], filename: string) {
        return await new Promise((resolve, reject) => {
            const ffmpegCmd = fluent_ffmpeg();
            voiceFiles.forEach(file => ffmpegCmd.input(file));
            ffmpegCmd.mergeToFile(filename, this.tempPath)
                .on('end', resolve)
                .on('error', reject);
        });
    }

    /**
     * Get a random background music file
     * @returns Path to the background music file
     * @throws Error if background music file not found
     */
    getRandomBgMusic() : string {
        let bgAudio: string;
        if (this.bgPath == undefined) {
            const audioFolder = path.join(this.resPath, 'music');
            const audioFiles = fs.readdirSync(audioFolder).filter(file => file.endsWith('.mp3'));
            const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
            bgAudio = path.join(audioFolder, randomAudioFile);
            return bgAudio;
        } else {
            bgAudio = this.bgPath;
            return bgAudio;
        }
    }

    /**
     * Get a random background video file
     * @returns Path to the background video file
     * @throws Error if background video file not found
     */
    getRandomBgVideo() : string {
        let bgVideo: string;
        if (this.vidPath == undefined) {
            const bgVideoFolder = path.join(this.resPath, 'vid');
            const bgVideoFiles = fs.readdirSync(bgVideoFolder).filter(file => file.endsWith('.mp4'));
            const randomBgVideoFile = bgVideoFiles[Math.floor(Math.random() * bgVideoFiles.length)];
            bgVideo = path.join(bgVideoFolder, randomBgVideoFile);
            return bgVideo;
        } else {
            bgVideo = this.vidPath;
            return bgVideo;
        }
    }

    /**
     * Combine voice file with background audio
     * @param voiceFile Voice file
     * @param bgAudio Background audio file
     * @param filename Output filename
     * @returns Promise that resolves when the audio file is created
     * @throws Error if ffmpeg command fails
     */
    async combineVoiceToBgAudio(voiceFile: string, bgAudio: string, filename: string) {        
        return await new Promise((resolve, reject) => {
            const ffmpegCmd = fluent_ffmpeg()
                .input(voiceFile)
                .input(bgAudio)
                .complexFilter([
                    '[0:a]volume=1[a1]',
                    '[1:a]volume=0.1[a2]',
                    '[a1][a2]amix=inputs=2:duration=first:dropout_transition=2'
                ])
                .output(filename)
                .on('end', resolve)
                .on('error', reject);

            ffmpegCmd.run();
        });
    }

    /**
     * Generate 16k frequency audio file
     * 
     * Used for whisper since it requires 16k frequency audio
     * 
     * @param audioFile Input audio file
     * @param outFilename Output filename
     * @returns Promise that resolves when the audio file is created
     * @throws Error if ffmpeg command fails
     */
    async genAudio16K(audioFile: string, outFilename: string) {
        return await new Promise((resolve, reject) => {
            const ffmpegCmd = fluent_ffmpeg()
                .input(audioFile)
                .audioFrequency(16000)
                .output(outFilename)
                .on('end', resolve)
                .on('error', reject);
    
            ffmpegCmd.run();
        });
    }

    /**
     * Merge audio files
     * 
     * Use this method for 2 audio files
     * 
     * Use `mergeMultiAudio()` for more than 2 audio files
     * 
     * @param baseFile Base audio file
     * @param inputFile Input audio file
     * @param outFilename Output filename
     * @returns Promise that resolves when the audio file is created
     * @throws Error if ffmpeg command fails
     */
    async mergeAudio(baseFile: string, inputFile: string, outFilename: string) {
        return await new Promise((resolve, reject) => {
            const ffmpegCmd = fluent_ffmpeg();
            ffmpegCmd.input(baseFile);
            ffmpegCmd.input(inputFile);
            ffmpegCmd.mergeToFile(outFilename, this.tempPath)
                .on('end', resolve)
                .on('error', reject);                        
        });
    }

    /**
     * Merge multiple audio files
     * 
     * Use this method for more than 2 audio files
     * 
     * Use `mergeAudio()` for 2 audio files
     * 
     * @param base1File Base audio file 1
     * @param base2File Base audio file 2
     * @param inputFile Input audio file
     * @param outFilename Output filename
     * @returns Promise that resolves when the audio file is created
     * @throws Error if ffmpeg command fails
     */
    async mergeMultiAudio(base1File: string, base2File: string, inputFile: string, outFilename: string) {
        return await new Promise((resolve, reject) => {
            const ffmpegCmd = fluent_ffmpeg();
            ffmpegCmd.input(base1File);
            ffmpegCmd.input(inputFile);
            ffmpegCmd.input(base2File);
            ffmpegCmd.mergeToFile(outFilename, this.tempPath)
                .on('end', resolve)
                .on('error', reject);                        
        });
    }

    /**
     * Get the duration of an audio file
     * @param audioFile Audio file
     * @returns Promise that resolves with the duration of the audio file
     * @throws Error if ffprobe command fails
     */
    async getAudioDuration(audioFile: string) : Promise<number> {
        return await new Promise((resolve, reject) => {
            fluent_ffmpeg.ffprobe(audioFile, (err, metadata) => {
                if (err) reject(err);
                resolve(metadata.format.duration ?? 0);
            });
        });
    }

    /**
     * Get the durations of a list of audio files
     * @param audioFiles List of audio files
     * @returns Promise that resolves with a list of durations of the audio files
     * @throws Error if ffprobe command fails
     */
    async getListOfDurations(audioFiles: string[]) : Promise<number[]> {
        return await Promise.all(audioFiles.map(file => {
            return new Promise<number>((resolve, reject) => {
                fluent_ffmpeg.ffprobe(file, (err, metadata) => {
                    if (err) reject(err);
                    resolve(metadata.format.duration ?? 0);
                });
            });
        }));
    }

    // Method to be overridden by subclasses
    async generateVideo() {
        throw new Error("Method 'generateVideo' must be implemented");
    }
}
