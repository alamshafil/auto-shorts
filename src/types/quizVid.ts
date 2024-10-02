// Copyright (c) 2024 Shafil Alam

import { FFCreator, FFScene, FFSubtitle, FFText, FFVideo } from "ffcreator-autoshorts";
import { VideoGen } from "../videogen";
import path from 'path';

/**
 * Quiz video data
 */
export interface QuizVideoData {
    /** Video type (must be quiz) */
    type: "quiz";
    /** Video title */
    title: string;
    /** List of questions */
    questions: {
        /** Question text */
        question: string;
        /** Answer text */
        answer: string;
    }[];
    /** Start script to be spoken */
    start_script: string;
    /** End script to be spoken */
    end_script: string;
    /** Font name (optional) */
    fontName?: string;
}

/**
 * AI prompt for each JSON field of QuizVideoData
 * Prompt will be given to AI and result will be placed inside JSON field of data.
 */
export const quizVideoAIPrompt = {
    title: 'Generate title for the quiz video. Make it short and catchy! (It needs to fit in the video) Use JSON format. Use this template: {"title": ""}',
    questions: 'Generate questions and answers for the quiz video. Use JSON object array format. Use this template: {"questions": [{"question": "", "answer": ""}]}. Make the answer short and simple since it needs to fit in the video.',
    start_script: 'Generate what will be spoken at start of the quiz video. Use JSON format. Use this template: {"start_script": ""}',
    end_script: 'Generate what will be spoken at end of the quiz video. Use JSON format. Use this template: {"end_script": ""}',
    // fontName: "Generate font name for the quiz video"
}

/**
 * Quiz video generation
 */
export class QuizVideo extends VideoGen {

    /**
     * Check JSON data
     * @throws Error if JSON data is missing required fields
     */
    checkJson() {
        if (!this.jsonData.title || !this.jsonData.questions) {
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
        const questions: {question: string, answer:string}[] = this.jsonData.questions;
        const start_script = this.jsonData.start_script;
        const end_script = this.jsonData.end_script;

        this.log('Creating voices for each message in the script...');
        const voiceFiles = [];

        // Generate voices for each message in the script

        // Gen start voice
        if (start_script) {
            const filename = path.join(this.tempPath, 'start.wav');
            await this.generateVoice({ text: start_script, voice: 'male', filename});
            voiceFiles.push(filename);
        }

        // Gen questions voice
        for (const [index, question] of questions.entries()) {
            const questionFilename = path.join(this.tempPath, `question-${index}`);
            const script = `Question ${index + 1}: ${question.question}`;
            await this.generateVoice({ text: script, voice: 'male', filename: questionFilename + ".wav" });

            const answerFilename = path.join(this.tempPath, `answer-${index}`);
            const answer = question.answer;
            await this.generateVoice({ text: answer, voice: 'male', filename: answerFilename + ".wav" });

            // Merge img/clock.mp3 to the question voice
            const clockAudio = path.join(this.resPath, 'clock.mp3');
            const fullAudio = `${questionFilename}-full.wav`;
            await this.mergeMultiAudio(questionFilename + ".wav", answerFilename + ".wav", clockAudio, fullAudio);

            this.log(`Full clock file created: ${fullAudio}`);

            voiceFiles.push(fullAudio);
        }
        // Gen end voice
        if (end_script) {
            const filename = path.join(this.tempPath, 'end.wav');
            await this.generateVoice({ text: end_script, voice: 'male', filename });
            voiceFiles.push(filename);
        }

        this.log('Voices created successfully!');

        // Combine audio files into a single audio file
        this.log('Creating single audio file from all voice files...');
        const voiceFile = path.join(this.tempPath, 'voice.wav');

        await this.combineVoiceFiles(voiceFiles, voiceFile);

        this.log('Audio file created successfully!');

        this.log('Making list of durations for each audio file...');
        const durations = await this.getListOfDurations(voiceFiles);

        // Overlay background audio on top of the voice audio file
        this.log('Overlaying background audio on top of the voice audio file...');

        // Choose a random background audio file .mp3 from the music folder
        const bgAudio = this.getRandomBgMusic();
        this.log(`Background audio file: ${bgAudio}`);

        const audioFile = path.join(this.tempPath, 'audio.wav');

        await this.combineVoiceToBgAudio(voiceFile, bgAudio, audioFile);

        // Make 16k audio file
        const audio16kFile = path.join(this.tempPath, 'audio16k.wav');
        await this.genAudio16K(audioFile, audio16kFile);

        this.log('Background audio overlay complete!');

        this.log('Creating subtitles from text...');
        const srtFile = path.join(this.tempPath, 'audio16k.wav.srt');
        await this.generateSubtitles(audio16kFile, srtFile, 30);

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

        //  Show message images on screen based on audio duration; stack vertically; hide then show once duration is reached
        const scene = new FFScene();
        scene.setBgColor('#000000');
        scene.setDuration(fullDuration);
        
        // Get random video background
        const bgVideo = this.getRandomBgVideo();
        this.log(`Background video file: ${bgVideo}`);

        const bg = new FFVideo({ path: bgVideo, x: width/2, y: height/2, width: width, height: height });
        bg.setAudio(false);
        scene.addChild(bg);

        // Add title text
        const titleObj = new FFText({
            text: title,
            x: width / 2,
            y: 150,
            fontSize: 60,
            color: '#ffffff',
            // fontFamily: ['Bangers'],
        });

        titleObj.alignCenter()

        titleObj.setStyle({
            fontFamily: [(this.jsonData.fontName ?? 'Bangers')],
            // fontWeight: 'bold',
            color: '#fff',
            stroke: '#000000',
            strokeThickness: 20,
        });

        scene.addChild(titleObj);

        // Add questions and answers
        for (const [index, question] of questions.entries()) {
            const question_start_duration = (durations.slice(0, index + 2).reduce((a, b) => a + b, 0) - 1);

            // Get color based on index (green, red, yellow, cyan, orange, purple, pink)
            const colors = ['#00FF00', '#FF0000', '#FFFF00', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'];
            const randomColor = colors[index];

            // Black outline
            const outlineColor = '#000000';

            const questionObj = new FFText({
                text: `${index + 1}.`,
                x: 100,
                y: 600 + (200 * index),
                fontSize: 90,
                color: randomColor,
                // fontFamily: ['Bangers'],
            });

            questionObj.setStyle({
                fontFamily: [(this.jsonData.fontName ?? 'Bangers')],
                // fontWeight: 'bold',
                color: randomColor,
                stroke: outlineColor,
                strokeThickness: 20,
            });

            scene.addChild(questionObj);

            const answerObj = new FFText({
                text: question.answer,
                x: 100 + 100,
                y: 600 + (200 * index),
                fontSize: 90,
                color: randomColor,
                // fontFamily: ['Bangers'],
            });

            answerObj.addEffect('fadeIn', 0.2, question_start_duration);

            answerObj.setStyle({
                fontFamily: [(this.jsonData.fontName ?? 'Bangers')],
                // fontWeight: 'bold',
                color: randomColor,
                stroke: outlineColor,
                strokeThickness: 20,
            });

            scene.addChild(answerObj);
        } 

        // Add subtitles
        const subStyle = {
            fontFamily: [(this.jsonData.fontName ?? 'Bangers')],
            // fontWeight: 'bold',
            color: '#fff',
            stroke: '#000000',
            strokeThickness: 20,
        };

        const subObj = new FFSubtitle({
            path: path.join(this.tempPath, 'audio16k.wav.srt'),
            x: width / 2, 
            y: 400, 
            fontSize: 70, 
            backgroundColor: '#000000', 
            color: '#fff', 
            comma: true,
            style: subStyle
        });

        subObj.setStyle(subStyle);

        this.log("Subtitles file is " + srtFile)

        // subObj.setFont(path.join(__dirname, '/res/Mont.otf'));
        subObj.addAnimate("down");
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
