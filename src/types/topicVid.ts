// Copyright (c) 2024 Shafil Alam

import { VideoGen } from '../videogen';
import { FFScene, FFVideo, FFAlbum, FFCreator, FFSubtitle } from "ffcreator-autoshorts";
import path from 'path';

/**
 * Topic video data
 */
export interface TopicVideoData {
    /** Video type (must be topic) */
    type: "topic";
    /** Video title */
    title: string;
    /** Video script text */
    text: string;
    /** Extra start information */
    start_script: string;
    /** Extra end information */
    end_script: string;
    /** Images for the video. List of image search terms for API */
    images: string[];
    /** Font name (optional) */
    fontName?: string;
    /** Font size (optional) */
    fontSize?: number;
    /** Override images with base64 encoded images (optional) */
    imgOverride?: string[];
}

/**
 * AI prompt for each JSON field of TopicVideoData
 * Prompt will be given to AI and result will be placed inside JSON field of data.
 */
export const topicVideoAIPrompt = {
    text: 'Generate what will be spoken in the video based on topic. Use JSON format. Use this template: {"text": ""}',
    // start_script: "Generate what will be spoken at start of the video",
    // end_script: "Generate what will be spoken at end of the video",
    images: 'Generate images (search terms) for the video based on topic. Use JSON array format. Only valid JSON, no extra info. Use this template: {"images": ["", ""]}',
};

/**
 * Topic video generation
 */
export class TopicVideo extends VideoGen {

    /**
     * Check JSON data
     * @throws Error if JSON data is missing required fields
     */
    checkJson() {
        if (!this.jsonData.text) {
            throw new Error('Error: JSON data is missing required "text" field!');
        }
    }

    /**
     * Generate video
     */
    async generateVideo() {
        this.checkJson();
        this.checkTempPath();

        this.log('Creating voices based on text...');
        const voiceFiles: string[] = [];

        const ttsFilename = path.join(this.tempPath, 'voice.wav');
        await this.generateVoice({ text: this.jsonData.text, voice: "male", filename: ttsFilename });
        voiceFiles.push(ttsFilename);

        const extraInfo = this.jsonData.extra;
        if (extraInfo) {
            this.log('Extra info: ' + extraInfo);
            const filename = path.join(this.tempPath, 'extra.wav');

            await this.generateVoice({ text: extraInfo, voice: "male", filename: filename });
            voiceFiles.push(filename);
        }

        this.log('Voices created successfully!');

        // Combine audio files into a single audio file
        this.log('Creating single audio file from all voice files...');
        const voiceFile = path.join(this.tempPath, 'voice_full.wav');

        await this.combineVoiceFiles(voiceFiles, voiceFile);

        this.log('Audio file created successfully!');

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

        // Make 16k audio file for whisper
        const audio16kFile = path.join(this.tempPath, 'audio16k.wav');

        await this.genAudio16K(audioFile, audio16kFile);

        this.log('Background audio overlay complete!');

        // Create images
        const images = this.jsonData.images;
        if (!images && !this.jsonData.imgOverride) {
            throw Error('JSON data is missing required "images" field!');
        }

        let imgs: string[] = [];

        if (this.jsonData.imgOverride) {
            this.log('Using base64 encoded images...');
            imgs = await this.saveBase64Images(this.jsonData.imgOverride);
            console.log(imgs)
        } else {
            this.log('Creating images from JSON data...');
            imgs = await this.generateImages(images);
        }

        this.log('Creating subtitles from text...');
        const srtFile = path.join(this.tempPath, 'audio16k.wav.srt');
        await this.generateSubtitles(audio16kFile, srtFile, this.subtitleOptions?.maxLen ?? 30);

        // Create video from audio file with on-screen text
        this.log('Creating video from audio file with on-screen text...');
        const videoFile = path.join(this.tempPath, 'video.mp4');

        const [width, height] = this.getResolution();

        const creator = new FFCreator({
            output: videoFile,
            width: width,
            height: height,
            audio: audioFile,
            log: true,
        });

        this.log("Audio file is " + audioFile)
        this.log("Video file is " + videoFile)

        // Get duration of audio file
        const full_duration = await this.getAudioDuration(audioFile);

        this.log("Full duration of audio is " + full_duration)

        creator.setDuration(full_duration);

        const scene = new FFScene();
        scene.setBgColor('#000000');
        scene.setDuration(full_duration);

        // Add background video if not disabled
        if (this.useBgVideo) {
            // Get random video background
            const bgVideo = await this.getRandomBgVideo();
            this.log("Background video is " + bgVideo)

            // Add background video
            const bg = new FFVideo({ path: bgVideo, x: width / 2, y: height / 2, width: width, height: height });
            bg.setAudio(false);
            scene.addChild(bg);
        } else {
            // Handle no background video
            this.log('No background video enabled! Skipping background video...');
        }

        // Add images
        const album = new FFAlbum({
            list: imgs,
            x: width / 2,
            y: (this.useBgVideo) ? height / 2 - 100 : height / 2,
            width: (this.useBgVideo) ? 512 : width,
            height: (this.useBgVideo) ? 512 : height,
            showCover: false,
        });

        album.setTransition("fadeIn")
        album.setTransTime(0.2);
        this.log("Album duration is " + Math.round(full_duration / imgs.length))
        album.setDuration(Math.round(full_duration / imgs.length));
        scene.addChild(album);

        // Add subtitles
        const subStyle = {
            fontFamily: [(this.subtitleOptions?.fontName ?? 'Bangers')],
            color: this.subtitleOptions?.fontColor ?? '#fff',
            stroke: this.subtitleOptions?.strokeColor ?? '#000000',
            strokeThickness: this.subtitleOptions?.strokeWidth ?? 20,
        }

        const subObj = new FFSubtitle({
            path: path.join(this.tempPath, 'audio16k.wav.srt'),
            x: width / 2,
            y: (height / 2) + 200,
            fontSize: this.subtitleOptions?.fontSize ?? 80,
            backgroundColor: this.subtitleOptions?.strokeColor ?? '#000000',
            color: this.subtitleOptions?.fontColor ?? '#fff',
            comma: true,
            style: subStyle
        });

        subObj.setStyle(subStyle);

        this.log("Subtitles file is " + this.tempPath + "\\audio.wav.srt")

        // subObj.setFont(path.join(__dirname, '/res/Mont.otf'));
        subObj.addAnimate("down");
        subObj.setText(this.jsonData.text);
        subObj.setSpeech(audioFile);
        subObj.frameBuffer = 24;

        scene.addChild(subObj);

        creator.addChild(scene);

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
