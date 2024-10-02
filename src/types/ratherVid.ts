// Copyright (c) 2024 Shafil Alam

import { createCanvas, loadImage } from "canvas";
import { VideoGen } from "../videogen";
import { FFCreator, FFImage, FFScene, FFText } from "ffcreator-autoshorts";
import fs from "fs";
import path from "path";

/**
 * Rather video data
 */
export interface RatherVideoData {
    /** Video type (must be rather) */
    type: "rather";
    /** Video title */
    title: string;
    /** 
     * List of questions
     * 
     * Code will append "Would you rather" to the beginning of each option.
     * Example: "Would you rather 'eat pizza' or 'eat pasta'?"
     * 
     * @example
     * [
     *   {
     *     option1: "eat pizza",
     *     option2: "eat pasta",
     *     p1: 60,
     *     p2: 40,
     *     image1: "pizza",
     *     image2: "pasta"
     *   },
     *   {
     *     option1: "drink coffee",
     *     option2: "drink tea",
     *     p1: 30,
     *     p2: 70,
     *     image1: "coffee",
     *     image2: "tea"
     *   }
     * ]
     */
    questions: {
        /** Option 1 */
        option1: string;
        /** Option 2 */
        option2: string;
        /** Percent for option 1 */
        p1: number;
        /** Percent for option 2 */
        p2: number;
        /** Image query for option 1 */
        image1: string;
        /** Image query for option 2 */
        image2: string;
    }[];
    /** Start script */
    start_script: string;
    /** End script */
    end_script: string;
    /** Font name (optional) */
    fontName?: string;
}

/**
 * AI prompt for each JSON field of RatherVideoData
 * Prompt will be given to AI and result will be placed inside JSON field of data.
 */
export const ratherVideoAIPrompt = {
    questions: 'List of questions for the video. Use JSON format as array of objects. Use this template: {"questions": [{"option1": "", "option2": "", "p1": 0, "p2": 0, "image1": "", "image2": ""}]}. p1 and p2 are the respective percent chosen by people that adds up to 100%. image1 and image2 are image search terms for respective option. I will append "Would you rather" to the beginning of each option, so omit that part in your response.',
    start_script: 'Generate what will be spoken at start of the video. Do not include questions in this field. Do a simple greeting or introduction to the game. Use JSON format. Use this template: {"start_script": ""}',
    end_script: 'Generate what will be spoken at end of the video. Do not include questions in this field. Do a simple goodbye or thank you message. Use JSON format. Use this template: {"end_script": ""}',
};

/**
 * Rather video generation
 */
export class RatherVideo extends VideoGen {

    /**
     * Check JSON data
     * @throws Error if JSON data is missing required fields
     */
    checkJson() {
        if (!this.jsonData.questions || !this.jsonData.start_script || !this.jsonData.end_script) {
            throw Error('JSON data is missing required fields!');
        }
    }

    /**
     * Generate video
     */
    async generateVideo() {
        this.checkJson();

        // TODO: Add support for horizontal orientation
        // Check if video orientation is horizontal
        if (this.orientation == "horizontal") {
            throw new Error("Rather video does not support horizontal orientation as of now.");
        }

        this.checkTempPath();

        const questions = this.jsonData.questions;
        const start_script = this.jsonData.start_script;
        const end_script = this.jsonData.end_script;

        this.log('Creating voices for each message in the script...');
        const voiceFiles: string[] = [];

        if (start_script) {
            const filename = path.join(this.tempPath, 'start.wav');
            await this.generateVoice({ text: start_script, voice: "male", filename: filename });
            voiceFiles.push(filename);
        }

        // Gen questions voice
        for (const [index, question] of questions.entries()) {
            const questionFilename = path.join(this.tempPath, `question-${index}`);
            const script = `Would you rather ${question.option1} or ${question.option2}?`;
            await this.generateVoice({ text: script, voice: "male", filename: questionFilename + ".wav" });

            // Merge img/clock.mp3 to the question voice
            const clockAudio = path.join(this.resPath, 'tick.mp3');
            const fullAudio = `${questionFilename}-full.wav`;
            await this.mergeAudio(questionFilename + ".wav", clockAudio, fullAudio);

            voiceFiles.push(fullAudio);
             
            this.log(`Full clock file created: ${fullAudio}`);
        }

        if (end_script) {
            const filename = path.join(this.tempPath, 'end.wav');
            await this.generateVoice({ text: end_script, voice: 'male', filename: filename });
            voiceFiles.push(filename);
        }
        
        this.log('Voices created successfully!');

        // Combine audio files into a single audio file
        this.log('Creating single audio file from all voice files...');
        const voiceFile = path.join(this.tempPath, 'voice.wav');

        await this.combineVoiceFiles(voiceFiles, voiceFile);

        this.log('Audio file created successfully!');

        // Get durations of each audio file
        this.log('Making list of durations for each audio file...');
        const durations = await this.getListOfDurations(voiceFiles);

        // Overlay background audio on top of the voice audio file
        this.log('Overlaying background audio on top of the voice audio file...');
        
        // Choose a random background audio file .mp3 from the music folder
        const bgAudio = this.getRandomBgMusic();
        this.log(`Background audio file: ${bgAudio}`);

        const audioFile = path.join(this.tempPath, 'audio.wav');

        await this.combineVoiceToBgAudio(voiceFile, bgAudio, audioFile);

        this.log('Background audio overlay complete!');

        // Find images for each question
        this.log('Finding images for each question...');
        const rankImages = [];

        for (const [index, question] of questions.entries()) {
            if (this.internalOptions.changePhotos) {
                const image1_query = question.image1;
                const image2_query = question.image2;
                this.log(`Question ${index + 1}:\n Image 1: ${image1_query}\n Image 2: ${image2_query}`);

                const images1 = await this.generateImages([image1_query], `q${index}-1`);
                const images2 = await this.generateImages([image2_query], `q${index}-2`);

                const image1 = images1[0];
                const image2 = images2[0];

                rankImages.push([image1, image2]);

                this.log(`Images downloaded for question ${index + 1}\n Image 1: ${image1}\n Image 2: ${image2}`);
            } else {
                const image1 = path.join(this.tempPath, `image-q${index}-1.png`);
                const image2 = path.join(this.tempPath, `image-q${index}-2.png`);
                rankImages.push([image1, image2]);

                this.log(`Images found for question ${index + 1}\n Image 1: ${image1}\n Image 2: ${image2}`);
            }
        }

        // Create images for each question
        this.log('Creating images for each question...');
        const imageFiles = [];

        const [width, height] = this.getResolution();

        for (const [index, question] of questions.entries()) {
            const option1 = question.option1;
            const option2 = question.option2;

            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            
            // Use img/rather.png as background
            const background = await loadImage(path.join(this.resPath, 'rather.png'));
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Add text for each option
            ctx.font = `70px ${this.jsonData.fontName ?? 'Bangers'}`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 20;
            ctx.strokeText(option1, canvas.width / 2, 700);
            ctx.strokeText(option2, canvas.width / 2, 1300);
            ctx.fillText(option1, canvas.width / 2, 700);
            ctx.fillText(option2, canvas.width / 2, 1300);

            // Draw images for each option
            const q_images = rankImages[index];
            const q_image1 = await loadImage(q_images[0]);
            const q_image2 = await loadImage(q_images[1]);

            const imageWidth = 400;
            const imageHeight = 400;
            const imageX = (canvas.width - imageWidth) / 2;

            ctx.drawImage(q_image1, imageX, 180, imageWidth, imageHeight);
            ctx.drawImage(q_image2, imageX, 1350, imageWidth, imageHeight);

            const imageFile = path.join(this.tempPath, `question-${index}.png`);
            const out = fs.createWriteStream(imageFile);
            const stream = canvas.createPNGStream();
            stream.pipe(out);

            imageFiles.push(imageFile);

            this.log(`Image created for question ${index + 1}`);
        }

        // Wait 1 seconds
        this.log('Waiting 1 seconds...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create video from audio file with on-screen text
        this.log('Creating video from audio file with on-screen text...');
        const videoFile = path.join(this.tempPath, 'video.mp4');

        // make ffcreator with 720*120 with background video from img/background.mp4 and set duration to sum to full audio duration
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

        // Turn each background image into a scene and make the duration equal to the duration of the audio file of index+1
        let sum = 0;
        for (const [index, imageFile] of imageFiles.entries()) {
            const scene = new FFScene();
            scene.setBgColor('#000000');

            const image = new FFImage({ path: imageFile, x: width / 2, y: height / 2, width: width, height: height });
            scene.addChild(image);

            let duration = durations[index + 1] ?? 0;
            sum += duration;

            if (index == 0) {
                duration += durations[0];
                sum += durations[0];
            }

            if (index == imageFiles.length - 1) {
                duration += durations[durations.length - 1];
                sum += durations[durations.length - 1];
            }

            scene.setDuration(duration);

            // Add percent to top and bottom of choice
            const p1 = this.jsonData.questions[index].p1 ?? 0;
            const p2 = this.jsonData.questions[index].p2 ?? 0;
            const useGreenTop = p1 > p2;
            const useGreenBottom = p1 < p2;

            const percent1 = new FFText({ text: `${p1}%`, x: 1080 / 2, y: 780, fontSize: 80, color: useGreenTop ? '#00ff00' : '#ff0000'});
            const percent2 = new FFText({ text: `${p2}%`, x: 1080 / 2, y: 1120, fontSize: 80, color: useGreenBottom ? '#00ff00' : '#ff0000'});

            percent1.alignCenter();
            percent2.alignCenter();

            percent1.setStyle({
                fontFamily: [(this.jsonData.fontName ?? 'Bangers')],
                stroke: '#000000',
                strokeThickness: 10,
            });

            percent2.setStyle({
                fontFamily: [(this.jsonData.fontName ?? 'Bangers')],
                stroke: '#000000',
                strokeThickness: 10,
            });

            percent1.setDuration(duration);
            percent2.setDuration(duration);

            let delayLen = duration - 2;
            if (delayLen < 0) {
                delayLen = 0;
            }

            if (index == imageFiles.length - 1) {
                delayLen -= durations[durations.length - 1];
            }

            percent1.addEffect('fadeIn', 0.2, delayLen);
            percent2.addEffect('fadeIn', 0.2, delayLen);

            scene.addChild(percent1);
            scene.addChild(percent2);

            creator.addChild(scene);
        }

        this.log("Sum of scene durations is " + sum)

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
