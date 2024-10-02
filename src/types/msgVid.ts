// Copyright (c) 2024 Shafil Alam

import { VideoGen } from '../videogen';
import { FFScene, FFVideo, FFCreator, FFImage } from "ffcreator-autoshorts";
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

/**
 * Message video data
 */
export interface MessageVideoData {
    /** Video type (must be message) */
    type: "message";
    /** Contact name of text message story */
    contactname: string;
    /** 
     * List of messages in the story 
     * Each message has the following fields:
     * - voice: Voice
     * - message: Message text
     * - msgtype: Message type (receiver or sender)
     */
    script: {
        /** Voice of the message. Can be male or female */
        voice: "male" | "female",
        /** Message text */
        message: string;
        /** Message type (receiver or sender) */
        msgtype: "receiver" | "sender";
    }[];
    /** Extra information to be spoken at the end of the video */
    extra: string;
    /** Font name (optional) */
    fontName?: string;
}

/**
 * AI prompt for each JSON field of MessageVideoData
 * Prompt will be given to AI and result will be placed inside JSON field of data.
 */
export const messageVideoAIPrompt = {
    contactname: 'Generate the contact name of the text message story. Use JSON format. Use this template: {"contactname": ""}',   
    script: 'Generate the script for the text message story. Use JSON object array format. Use this template: {"script": [{"voice": "", "message": "", "msgtype": ""}]}. "voice" will be "male" or "female", "msgtype" will be "receiver" or "sender". "message" will be the message text. The receiver will be on the left and the sender will be on the right. The receiver is the contact name talking to the sender. Make the message short and simple, in order to fit in video, and like real text messages.',
    extra: 'Generate the extra information to be spoken at the end of the video. Do a simple summary of the story and say goodbye Use JSON format. Use this template: {"extra": ""}',
};

/**
 * Message video generation class
 */
export class MsgVideo extends VideoGen {

    /**
     * Check JSON data
     * @throws {Error} if JSON data is missing required fields
     */
    checkJson() {
        if (!this.jsonData.contactname || !this.jsonData.script) {
            throw Error('JSON data is missing required fields!');
        }
    }

    /**
     * Generate video
     */
    async generateVideo() {
        this.checkJson();
        this.checkTempPath();

        const contactName = this.jsonData.contactname;
        const script = this.jsonData.script;

        this.log('Creating voices for each message in the script...');
        const voiceFiles = [];

        for (const [index, message] of script.entries()) {
            const filename = path.join(this.tempPath, `message${index}.wav`);

            await this.generateVoice({ text: message.message, voice: message.voice, filename: filename });

            voiceFiles.push(filename);
        }

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
        const voiceFile = path.join(this.tempPath, 'voice.wav');

        await this.combineVoiceFiles(voiceFiles, voiceFile);

        this.log('Audio file created successfully!');

        // Overlay background audio on top of the voice audio file
        this.log('Overlaying background audio on top of the voice audio file...');

        // Choose a random background audio file .mp3 from the music folder
        const bgAudio = this.getRandomBgMusic();
        this.log("Background audio is " + bgAudio)
    
        const audioFile = path.join(this.tempPath, 'audio.wav');
        await this.combineVoiceToBgAudio(voiceFile, bgAudio, audioFile);

        // Get durations of each audio file
        this.log('Making list of durations for each audio file...');
        const durations = await this.getListOfDurations(voiceFiles);

        // Create message header image with text
        this.log('Creating message header image with text...');
        const headerFile = await this.generateMessagHeader(contactName);

        this.log('Creating message images with text...');
        const messageImages = [];
        for (const [index, message] of script.entries()) {
            const filename = path.join(this.tempPath, `message${index}.png`);
            await this.createIOSMessageBubble(message.message, filename, message.msgtype === 'sender');
            messageImages.push(filename);
        }

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
        
        // get duration of audio file
        const fullDuration = await this.getAudioDuration(audioFile);

        this.log("Full duration of audio is " + fullDuration)

        creator.setDuration(fullDuration);

        const scene = new FFScene();
        scene.setBgColor('#000000');
        scene.setDuration(fullDuration);
        
        // Get random video background
        const bgVideo = this.getRandomBgVideo();
        this.log(`Background video file: ${bgVideo}`);

        const bg = new FFVideo({ path: bgVideo, x: width/2, y: height/2, width: width, height: height });
        bg.setAudio(false);
        scene.addChild(bg);

        const header = new FFImage({ path: headerFile, x: width/2, y: 400 });
        scene.addChild(header);

        for (const [index, img] of messageImages.entries()) {
            this.log(`Image #${index} path is ${img}`)
            this.log(`Image #${index} y is ${((400 * 1.4) + (70 * index))}`)
            const messageImage = new FFImage({ path: img, x: width/2, y: ((400 * 1.4) + (70 * index)) });
            const imgStartDuration = durations.slice(0, index).reduce((a, b) => a + b, 0);
            messageImage.addEffect('fadeIn', 0.2, imgStartDuration);
            this.log(`Image #${index} start duration is ${imgStartDuration} s`)
            this.log(`Image #${index} full duration is ${(fullDuration - imgStartDuration)} s`)
            messageImage.setDuration(fullDuration - imgStartDuration);
            scene.addChild(messageImage);
        }

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

    async generateMessagHeader(name: string) : Promise<string> {        
        // registerFont(path.join(__dirname, '/../res/SF-Pro-Display-Regular.otf'), { family: 'SF Pro Display' });
        const headerImage = await loadImage(path.join(this.resPath, 'msg_header.png'));
        const headerCanvas = createCanvas(headerImage.width, headerImage.height);
        const headerCtx = headerCanvas.getContext('2d');
        headerCtx.drawImage(headerImage, 0, 0);
        headerCtx.font = `20px "${this.jsonData.fontName ?? 'SF Pro Display'}"`;
        headerCtx.fillStyle = 'white';
        headerCtx.textAlign = 'center';
        headerCtx.fillText(name, headerImage.width / 2, 225);
        const headerFile = path.join(this.tempPath, 'msg_header.png');
        fs.writeFileSync(headerFile, headerCanvas.toBuffer('image/png'));
        this.log('Message header image created successfully!');
        return headerFile;
    }

    // Create message images with text
    async createIOSMessageBubble(message: string, output_file: string, sender = true) {
        const padding = 10;
        const canvas = createCanvas(828, 1280);
        const ctx = canvas.getContext('2d');
    
        // Set up text properties
        ctx.font = '30px "SF Pro Display"';
        ctx.textBaseline = 'top';
        const textWidth = ctx.measureText(message).width;
        const textHeight = parseInt(ctx.font);
    
        // Set image dimensions
        const imageWidth = 828 - padding * 2;
        const imageHeight = textHeight + padding * 2;
        const bubbleColor = sender ? 'rgba(0, 122, 255, 1)' : 'rgba(50, 50, 50, 1)';
        const textColor = 'rgba(255, 255, 255, 1)';
    
        const mainCanvas = createCanvas(imageWidth, imageHeight);
        
        const mainCtx = mainCanvas.getContext('2d');
        mainCtx.font = '30px "SF Pro Display"';
        mainCtx.textBaseline = 'top';
    
        mainCtx.fillStyle = 'rgba(0, 0, 0, 255)';
        mainCtx.fillRect(0, 0, imageWidth, imageHeight);
    
        // Draw bubble
        const bubble_size_x = sender ? (imageWidth - textWidth - padding * 2) : 0;
        const bubble_size_y = 0;
        const bubble_w = textWidth + padding * 2;
        const bubble_h = imageHeight;
        const radius = 20;
    
        mainCtx.fillStyle = bubbleColor;
        mainCtx.beginPath();
        mainCtx.moveTo(bubble_size_x + radius, bubble_size_y);
        mainCtx.lineTo(bubble_size_x + bubble_w - radius, bubble_size_y);
        mainCtx.quadraticCurveTo(bubble_size_x + bubble_w, bubble_size_y, bubble_size_x + bubble_w, bubble_size_y + radius);
        mainCtx.lineTo(bubble_size_x + bubble_w, bubble_size_y + bubble_h - radius);
        mainCtx.quadraticCurveTo(bubble_size_x + bubble_w, bubble_size_y + bubble_h, bubble_size_x + bubble_w - radius, bubble_size_y + bubble_h);
        mainCtx.lineTo(bubble_size_x + radius, bubble_size_y + bubble_h);
        mainCtx.quadraticCurveTo(bubble_size_x, bubble_size_y + bubble_h, bubble_size_x, bubble_size_y + bubble_h - radius);
        mainCtx.lineTo(bubble_size_x, bubble_size_y + radius);
        mainCtx.quadraticCurveTo(bubble_size_x, bubble_size_y, bubble_size_x + radius, bubble_size_y);
        mainCtx.closePath();
        mainCtx.fill();
    
        // Draw text
        const text_pos_x = sender ? (imageWidth - textWidth - padding) : padding;
        const text_pos_y = padding / 2;
    
        mainCtx.fillStyle = textColor;
        mainCtx.fillText(message, text_pos_x, text_pos_y);
    
        // Add padding to final image on all edges
        const finalImageWidth = imageWidth + padding * 2;
        const finalImageHeight = imageHeight + padding * 2;
        const finalCanvas = createCanvas(finalImageWidth, finalImageHeight);
        const finalCtx = finalCanvas.getContext('2d');
    
        finalCtx.fillStyle = 'rgba(0, 0, 0, 255)';
        finalCtx.fillRect(0, 0, finalImageWidth, finalImageHeight);
    
        finalCtx.drawImage(mainCanvas, padding, padding);
    
        // Save image
        const buffer = finalCanvas.toBuffer('image/png');
        fs.writeFileSync(output_file, buffer);
    };
}
