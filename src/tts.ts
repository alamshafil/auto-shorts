// Copyright (c) 2024 Shafil Alam

import { VideoGen } from "./videogen";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import say from "say";

/**
 * Voice generation types
 */
export enum VoiceGenType {
    ElevenLabs = "ElevenLabs",
    BuiltinTTS = "BuiltinTTS",
    NeetsTTS = "NeetsTTS",
}

/**
 * Voice API key Environment variables
 */
export enum VoiceAPIEnv {
    ElevenLabs = "ELEVENLABS_API_KEY",
    NeetsTTS = "NEETS_API_KEY",
}

/**
 * Voice generation options
 * @example
 * ```
 * {
 *  text: "Hello, how are you?",
 *  voice: "male",
 *  filename: "voice.wav",
 * }
 * ```
 */
export interface VoiceGenOptions {
    /** Text to convert to voice */
    text: string;
    /** Voice type: can be male or female */
    voice: "male" | "female";
    /** Filename to save the voice to */
    filename: string;
    /** ElevenLabs options */
    elevenLabsOptions?: ElevenLabsOptions;
    /** Neets options */
    neetsTTSOptions?: NeetsTTSOptions;
}

/**
 * ElevenLabs voice options
 */
export interface ElevenLabsOptions {
    /** Voice model */
    model?: "eleven_turbo_v2";
    /** Male voice model used for ElevenLabs */
    maleVoice?: "Will";
    /** Female voice model used for ElevenLabs */
    femaleVoice?: "Sarah";
}

/**
 * NeetsTTS voice options
 */
export interface NeetsTTSOptions {
    /** Voice model */
    voiceModel?: string;
    /** Male voice model */
    maleVoice?: string;
    /** Female voice model */
    femaleVoice?: string;
}

/**
 * Base class for voice generation
 * @abstract
 */
export class VoiceGen {
    static async generateVoice(gen: VideoGen, options: VoiceGenOptions) {
        throw new Error("Method 'generateVoice' must be implemented");
    }
}

/**
 * Voice generation using ElevenLabs API
 */
export class ElevenLabsVoice extends VoiceGen {

    /**
     * Generate voice using ElevenLabs API
     * @param gen VideoGen instance
     * @param options Voice generation options
     * @param apiKey ElevenLabs API key (required)
     */
    static async generateVoice(gen: VideoGen, options: VoiceGenOptions, apiKey?: string) {
        if (!apiKey) {
            throw new Error("ElevenLabs API key required for voice generation. Set via '--elevenlabsAPIKey' option or define 'ELEVENLABS_API_KEY' environment variable.");
        }

        const elevenlabs = new ElevenLabsClient({
            apiKey: apiKey
        });

        const voiceModel = (options.voice == "male") ?
            (options.elevenLabsOptions?.maleVoice ?? "Will") :
            (options.elevenLabsOptions?.femaleVoice ?? "Sarah");

        // TODO: Fix async issue
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise<void>(async (resolve, reject) => {
            try {
                const audio = await elevenlabs.generate({
                    voice: voiceModel,
                    text: options.text,
                    model_id: "eleven_turbo_v2"
                });

                const fileStream = fs.createWriteStream(options.filename);

                audio.pipe(fileStream);

                fileStream.on("finish", () => resolve());
                fileStream.on("error", reject);

                gen.log(`Voice created using Elevenlab for message ${options.filename}`);
            } catch (error) {
                reject(error);
            }
        });

    }
}

/**
 * Voice generation using NeetsTTS API
 */
export class NeetsTTSVoice extends VoiceGen {
    /**
     * Generate voice using NeetsTTS API
     * @param gen VideoGen instance
     * @param options Voice generation options
     * @param apiKey NeetsTTS API key (required)
     */
    static async generateVoice(gen: VideoGen, options: VoiceGenOptions, apiKey?: string) {
        if (!apiKey) {
            throw new Error("NeetsTTS API key required. Set via '--neetsAPIKey' option or define 'NEETS_API_KEY' environment variable.");
        }

        // const voiceModel = (options.voice == "male") ? "us-male-2" : "us-female-2";

        const voiceModel = (options.voice == "male") ?
            (options.neetsTTSOptions?.maleVoice ?? "us-male-2") :
            (options.neetsTTSOptions?.femaleVoice ?? "us-female-2");

        const data = JSON.stringify({
            text: options.text,
            voice_id: voiceModel,
            fmt: "wav",
            params: {
                model: options.neetsTTSOptions?.voiceModel ?? "style-diff-500"
            }
        });

        const response = await fetch(
            'https://api.neets.ai/v1/tts',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: data,
            }
        );

        if (!response.ok) {
            throw new Error(`NeetsTTS API error: ${response.statusText}.`);
        }

        const buffer = await response.arrayBuffer();
        fs.writeFileSync(options.filename, Buffer.from(buffer));

        gen.log(`Voice created using NeetsTTS for message ${options.filename}`);
    }
}

/**
 * Voice generation using built-in TTS
 */
export class BuiltinTTSVoice extends VoiceGen {

    /**
     * Generate voice using built-in TTS
     * @param gen VideoGen instance
     * @param options Voice generation options
     */
    static async generateVoice(gen: VideoGen, options: VoiceGenOptions) {
        const voiceModel = (options.voice == "male") ? "Alex" : "Vicki";
        return await new Promise<void>((resolve, reject) => {
            say.export(options.text, voiceModel, 1, options.filename, (err: any) => {
                if (err) gen.log(`[ignoring] Error creating voice for message: ${err.message}`);
                gen.log(`Voice created using Say for message ${options.filename}`);
                resolve();
            });
        });
    }
}
