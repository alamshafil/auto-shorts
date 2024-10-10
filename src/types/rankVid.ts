// Copyright (c) 2024 Shafil Alam

import { VideoGen } from "../videogen";
import { FFCreator, FFImage, FFScene } from "ffcreator-autoshorts";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import fs from "fs";

/**
 * Rank video data
 */
export interface RankVideoData {
    /** Video type (must be rank) */
    type: "rank";
    /** Video title */
    title: string;
    /** List of rankings
     * @example
     * ["TypeScript", "JavaScript", "C#"]
     */
    rankings: string[];
    /** Image descriptions for each rank
     * @example
     * ["TypeScript logo", "JavaScript logo", "C# logo"]
     */
    images: string[];
    /** Start script to be spoken */
    start_script: string;
    /** End script to be spoken */
    end_script: string;
}

/**
 * AI prompt for each JSON field of RankVideoData
 * Prompt will be given to AI and result will be placed inside JSON field of data.
 */
export const rankVideoAIPrompt = {
    title: 'Generate title of the video. Make it short and catchy! (It needs to fit in the video). Use JSON format. Use this template: {"title": ""}',
    rankings: 'List of rankings for the video. Use JSON array format. Use this template: {"rankings": ["", ""]}',
    images: 'List of short image search terms for each ranking item. Use JSON array format. Use this template: {"images": ["", ""]}',
    start_script: 'Generate what will be spoken at start of the video. Do not include rankings in this field. Do a simple greeting or introduction to the game. Use JSON format. Use this template: {"start_script": ""}',
    end_script: 'Generate what will be spoken at end of the video. Do not include rankings in this field. Do a simple goodbye or thank you message. Use JSON format. Use this template: {"end_script": ""}',
};

/**
 * Rank video generation
 */
export class RankVideo extends VideoGen {

    /**
     * Check JSON data
     * @throws Error if JSON data is missing required fields
     */
    checkJson() {
        if (!this.jsonData.rankings || !this.jsonData.images || !this.jsonData.start_script || !this.jsonData.end_script) {
            throw Error('JSON data is missing required fields!');
        }
    }

    /**
     * Generate video
     */
    async generateVideo() {
        this.checkJson();
        this.checkTempPath();

        const title = this.jsonData.title;
        const start_script = this.jsonData.start_script;
        const end_script = this.jsonData.end_script;
        const rankings = this.jsonData.rankings;
        const images = this.jsonData.images;

        const voicesFiles: string[] = [];

        if (start_script) {
            const filename = path.join(this.tempPath, 'start.wav');
            await this.generateVoice({ text: start_script, voice: "male", filename: filename });
            voicesFiles.push(filename);
        }

        for (const [index, rank] of rankings.entries()) {
            const rankFilename = path.join(this.tempPath, `rank-${index}`);
            await this.generateVoice({ text: rank, voice: "male", filename: rankFilename + ".wav" });

            // Merge res/tick.mp3 to the question voice
            const clockAudio = path.join(this.resPath, 'tick.mp3');
            const fullAudio = `${rankFilename}-full.wav`;
            await this.mergeAudio(rankFilename + ".wav", clockAudio, fullAudio);
            voicesFiles.push(fullAudio);

            this.log(`Full clock file created: ${fullAudio}`);
        }

        if (end_script) {
            const filename = path.join(this.tempPath, 'end.wav');
            await this.generateVoice({ text: end_script, voice: "male", filename: filename });
            voicesFiles.push(filename);
        }

        this.log('Voices created successfully!');

        // Combine audio files into a single audio file
        this.log('Creating single audio file from all voice files...');
        const voiceFile = path.join(this.tempPath, 'voice.wav');

        await this.combineVoiceFiles(voicesFiles, voiceFile);

        this.log('Audio file created successfully!');

        // Get durations of each audio file
        this.log('Making list of durations for each audio file...');
        const durations = await this.getListOfDurations(voicesFiles);


        // Video audio file (default is voice audio file)
        let audioFile = voiceFile;

        if (this.useBgMusic) {
            // Overlay background audio on top of the voice audio file
            this.log('Overlaying background audio on top of the voice audio file...');

            // Choose a random background audio file .mp3 from the music folder
            const bgAudio: string = await this.getRandomBgMusic();
            this.log("Background audio is " + bgAudio)

            audioFile = path.join(this.tempPath, 'audio.wav');

            await this.combineVoiceToBgAudio(voiceFile, bgAudio, audioFile);
        } else {
            this.log('Background audio overlay disabled! Using voice audio file only...');
        }

        // Find images for each rank
        this.log('Finding images for each rank...');
        const rankImages = await this.generateImages(images);

        // Create images from JSON data
        this.log('Creating images from JSON data...');

        const [width, height] = this.getResolution();

        const imageFiles = [];

        // Make inital scene with title
        const startCanvas = createCanvas(width, height);
        const startCtx = startCanvas.getContext('2d');

        // Put rank image
        const r_image = await loadImage(rankImages[0]);
        startCtx.drawImage(r_image, 0, 0, startCanvas.width, startCanvas.height);

        startCtx.font = `80px ${this.subtitleOptions?.fontName ?? 'Bangers'}`;
        startCtx.fillStyle = '#ffffff';
        startCtx.textAlign = 'center';
        startCtx.strokeStyle = '#000000';
        startCtx.lineWidth = 20;
        startCtx.strokeText(title, width / 2, 300);
        startCtx.fillText(title, width / 2, 300);

        // Show numbers based on length of rankings
        const numbers = rankings.length;
        for (let i = 0; i < numbers; i++) {
            startCtx.font = `90px ${this.subtitleOptions?.fontName ?? 'Bangers'}`;
            startCtx.fillStyle = '#ffffff';
            startCtx.textAlign = 'center';
            startCtx.strokeStyle = '#000000';
            startCtx.lineWidth = 20;
            startCtx.strokeText((i + 1).toString(), 200, 500 + (200 * i));
            startCtx.fillText((i + 1).toString(), 200, 500 + (200 * i));
        }

        const startImage = path.join(this.tempPath, 'start.png');
        const startOut = fs.createWriteStream(startImage);
        const startStream = startCanvas.createPNGStream();
        startStream.pipe(startOut);

        imageFiles.push(startImage);

        for (const [index, rank] of rankings.entries()) {
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Put rank image
            const rankImage = await loadImage(rankImages[index]);
            ctx.drawImage(rankImage, 0, 0, canvas.width, canvas.height);

            ctx.font = `90px ${this.subtitleOptions?.fontName ?? 'Bangers'}`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 20;
            ctx.strokeText(rank, width / 2, 300);
            ctx.fillText(rank, width / 2, 300);

            // Show numbers based on length of rankings
            const numbers = rankings.length;
            for (let i = 0; i < numbers; i++) {
                ctx.font = `80px ${this.subtitleOptions?.fontName ?? 'Bangers'}`;
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 20;
                ctx.strokeText((i + 1).toString(), 200, 500 + (200 * i));
                ctx.fillText((i + 1).toString(), 200, 500 + (200 * i));
            }

            const o_image = path.join(this.tempPath, `rank-${index}.png`);
            const out = fs.createWriteStream(o_image);
            const stream = canvas.createPNGStream();
            stream.pipe(out);

            imageFiles.push(o_image);
        }

        // Wait 1 seconds
        this.log('Waiting 1 seconds...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create video from audio file with on-screen text
        this.log('Creating video from audio file with on-screen text...');
        const videoFile = path.join(this.tempPath, 'video.mp4');

        const creator = new FFCreator({
            output: videoFile,
            width: width,
            height: height,
            audio: audioFile,
            log: true,
        });

        this.log("Audio file is " + audioFile)
        this.log("Video file is " + videoFile)

        // get duration of audio file
        const full_duration = await this.getAudioDuration(audioFile);

        this.log("Full duration of audio is " + full_duration)

        creator.setDuration(full_duration);

        for (const [index, imageFile] of imageFiles.entries()) {
            const scene = new FFScene();
            scene.setBgColor('#000000');

            const image = new FFImage({ path: imageFile, x: width / 2, y: height / 2, width: width, height: height });
            scene.addChild(image);

            let duration = durations[index] ?? 0;

            if (index == imageFiles.length - 1) {
                duration += durations[durations.length - 1];
            }

            this.log("Duration of scene " + index + " is " + duration)
            scene.setDuration(duration);

            creator.addChild(scene);
        }

        // creator.addChild(scene);

        creator.start();
        creator.closeLog();

        creator.on('start', () => {
            this.log(`FFCreator start`);
        });
        creator.on('error', e => {
            this.log(`FFCreator error: ${JSON.stringify(e)}`);
        });
        creator.on('progress', e => {
            this.log(`FFCreator progress: rendering ${(e.percent * 100) >> 0}%`);
        });
        creator.on('complete', e => {
            this.log(`FFCreator completed: \n USAGE: ${e.useage} \n PATH: ${e.output} `);
            this.emitter.emit('done', e.output);
        });
    }
}
