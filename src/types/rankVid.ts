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
    /** Font name (optional) */
    fontName?: string;
}

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

        // Overlay background audio on top of the voice audio file
        this.log('Overlaying background audio on top of the voice audio file...');
        const bgAudio = this.getRandomBgMusic();
        this.log(`Background audio file: ${bgAudio}`);

        const audioFile = path.join(this.tempPath, 'audio.wav');

        await this.combineVoiceToBgAudio(voiceFile, bgAudio, audioFile);

        this.log('Background audio overlay complete!');

        // Find images for each rank
        this.log('Finding images for each rank...');
        const rankImages = await this.generateImages(images);

        // Create images from JSON data
        this.log('Creating images from JSON data...');

        const imageFiles = [];

        // Make inital scene with title with canvas size 1080*1920
        const startCanvas = createCanvas(1080, 1920);
        const startCtx = startCanvas.getContext('2d');

        // Put rank image
        const r_image = await loadImage(rankImages[0]);
        startCtx.drawImage(r_image, 0, 0, startCanvas.width, startCanvas.height);

        startCtx.font = `80px ${this.jsonData.fontName ?? 'Bangers'}`;
        startCtx.fillStyle = '#ffffff';
        startCtx.textAlign = 'center';
        startCtx.strokeStyle = '#000000';
        startCtx.lineWidth = 20;
        startCtx.strokeText(title, 1080 / 2, 300);
        startCtx.fillText(title, 1080 / 2, 300);

        // Show numbers based on length of rankings
        const numbers = rankings.length;
        for (let i = 0; i < numbers; i++) {
            startCtx.font = `90px ${this.jsonData.fontName ?? 'Bangers'}`;
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
            const canvas = createCanvas(1080, 1920);
            const ctx = canvas.getContext('2d');

            // Put rank image
            const rankImage = await loadImage(rankImages[index]);
            ctx.drawImage(rankImage, 0, 0, canvas.width, canvas.height);

            ctx.font = `90px ${this.jsonData.fontName ?? 'Bangers'}`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 20;
            ctx.strokeText(rank, 1080 / 2, 300);
            ctx.fillText(rank, 1080 / 2, 300);

            // Show numbers based on length of rankings
            const numbers = rankings.length;
            for (let i = 0; i < numbers; i++) {
                ctx.font = `80px ${this.jsonData.fontName ?? 'Bangers'}`;
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
            width: 1080,
            height: 1920,
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

            const image = new FFImage({ path: imageFile, x: 1080 / 2, y: 1920 / 2, width: 1080, height: 1920 });
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
