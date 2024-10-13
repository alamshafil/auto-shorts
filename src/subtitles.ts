// Copyright (c) 2024 Shafil Alam

import { VideoGen } from "./videogen";
import { Whisper } from "smart-whisper";
import { decode } from "node-wav";
import fs from "fs";
import path from "path";

/**
 * Subtitle generation
 */
export class SubtitleGen {
    static async transcribeSrt(gen: VideoGen, audio16kFile: string, maxLen: number, srtFile: string, resPath: string, modelPath?: string) : Promise<any> {  
        throw new Error("Method 'transcribeSrt' must be implemented");
    }
}

/**
 * Whisper Subtitles
 */ 
export class WhisperSubtitles extends SubtitleGen {
    /** Default ggml model */
    static DEFAULT_MODEL = "ggml-base.en.bin";

    /** 
     * Transcribe audio file and save as SRT file
     * 
     * @param audio16kFile 16k audio file
     * @param maxLen Maximum length for token
     * @param srtFile SRT file path
     * @param resPath Resource path
     * @param modelPath Model path (optional)
     */
    static async transcribeSrt(gen: VideoGen, audio16kFile: string, maxLen: number, srtFile: string, resPath: string, modelPath?: string) : Promise<any> {  
        const transcript = await this.transcribe(gen, audio16kFile, maxLen, resPath, modelPath);
        await this.convertTranscriptionToSrt(transcript, srtFile);
    }

    /** 
     * Transcribe audio file
     * 
     * @param audio16kFile 16k audio file
     * @param maxLen Maximum length for token
     * @param resPath Resource path
     * @param modelPath Model path (optional)
     */
    static async transcribe(gen: VideoGen, audio16kFile: string, maxLen: number, resPath: string, modelPath?: string) : Promise<any> {        
        const model = modelPath ?? path.join(resPath, "models", WhisperSubtitles.DEFAULT_MODEL);
        const wav = audio16kFile;
        
        const whisper = new Whisper(model);
        const pcm = read_wav(wav);
        
        const task = await whisper.transcribe(pcm, {
             language: "en",
             max_len: maxLen,
             token_timestamps: true,
        });

        task.on("transcribed", (result) => {
            // Convert result to string
            const text = `from ${result.from} to ${result.to}, text: ${result.text}`;
            gen.log("[whisper] Transcribed: " + text);
        });

        const result = await task.result;
        // gen.log("[whisper] Final Transcription result: " + result);
        
        await whisper.free();
        gen.log("[whisper] Maunally freed whisper");
        
        return result;

        function read_wav(file: string): Float32Array {
            const { sampleRate, channelData } = decode(fs.readFileSync(file));
        
            if (sampleRate !== 16000) {
                throw new Error(`Invalid sample rate: ${sampleRate}`);
            }
            if (channelData.length !== 1) {
                throw new Error(`Invalid channel count: ${channelData.length}`);
            }
        
            return channelData[0];
        }
    }

    /**
     * Convert transcription to SRT format
     * 
     * @param transcript Transcription
     * @param srtFile SRT file path
     */
    static async convertTranscriptionToSrt(transcript: any, srtFile: string) {
        let srt = "";
        let idx = 1;
        for (const line of transcript) {
            const from = formatTime(line.from);
            const to = formatTime(line.to);
            const text = line.text.trim();
            srt += `${idx}\n`;
            srt += `${from} --> ${to}\n`;
            srt += `${text}\n\n`;
            idx += 1;
        }

        function formatTime(time: number): string {
            const date = new Date(time);
            const hours = date.getUTCHours().toString().padStart(2, "0");
            const minutes = date.getUTCMinutes().toString().padStart(2, "0");
            const seconds = date.getUTCSeconds().toString().padStart(2, "0");
            const milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0");
            return `${hours}:${minutes}:${seconds},${milliseconds}`;
        }

        fs.writeFileSync(srtFile, srt);
    }
}
