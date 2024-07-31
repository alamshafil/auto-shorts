// Copyright (c) 2024 Shafil Alam

import { VideoGen } from '../videogen';
import { FFScene, FFVideo, FFAlbum, FFCreator, FFSubtitle } from "ffcreator";
import { WhisperSubtitles } from '../subtitles';
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
}

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

        // Overlay background audio on top of the voice audio file
        this.log('Overlaying background audio on top of the voice audio file...');

        // Choose a random background audio file .mp3 from the music folder
        const bgAudio: string = await this.getRandomBgMusic();
        this.log("Background audio is " + bgAudio)

        const audioFile = path.join(this.tempPath, 'audio.wav');

        await this.combineVoiceToBgAudio(voiceFile, bgAudio, audioFile);

        // Make 16k audio file for whisper
        const audio16kFile = path.join(this.tempPath, 'audio16k.wav');

        await this.genAudio16K(audioFile, audio16kFile);

        this.log('Background audio overlay complete!');

        // Create images
        const images = this.jsonData.images;
        if (!images) {
            throw Error('JSON data is missing required "images" field!');
        }

        this.log('Creating images from JSON data...');

        let imgs: string[] = [];

        imgs = await this.generateImages(images);

        this.log('Creating subtitles from text...');
        const srtFile = path.join(this.tempPath, 'audio16k.wav.srt');
        if (!this.internalOptions.disableSubtitles) {
            await WhisperSubtitles.transcribeSrt(this, audio16kFile, 4, srtFile, this.resPath);
        }

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
    
        // Get duration of audio file
        const full_duration = await this.getAudioDuration(audioFile);
    
        this.log("Full duration of audio is " + full_duration)
    
        creator.setDuration(full_duration);
    
        const scene = new FFScene();
        scene.setBgColor('#000000');
        scene.setDuration(full_duration);
    
        // Get random video background
        const bgVideo = await this.getRandomBgVideo();
        this.log("Background video is " + bgVideo)
    
        // Add background video
        const bg = new FFVideo({ path: bgVideo, x: 1080 / 2, y: 1920 / 2, width: 1080, height: 1920 });
        bg.setAudio(false);
        scene.addChild(bg);
    
        // Add images
        const album = new FFAlbum({
            list: imgs,
            x: 1080 / 2,
            y: (1920 / 2) - 200,
            width: 512,
            height: 512,
            showCover: false,
        });
    
        album.setTransition("fadeIn")
        album.setTransTime(0.2);
        this.log("Album duration is " + Math.round(full_duration / imgs.length))
        album.setDuration(Math.round(full_duration / images.length));
        scene.addChild(album);
    
        // Add subtitles
        const subStyle = {
            fontFamily: ['Bangers'],
            color: '#fff',
            stroke: '#000000',
            strokeThickness: 20,
        }

        const subObj = new FFSubtitle({
            path: path.join(this.tempPath, 'audio16k.wav.srt'),
            x: 1080 / 2,
            y: (1920 / 2) + 200,
            fontSize: 40,
            backgroundColor: '#000000',
            color: '#fff',
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
