export interface MessageVideoData {
    type: "message";
    contactname: string;
    script: {
        voice: "male" | "female";
        message: string;
        msgtype: "receiver" | "sender";
    }[];
    extra: string;
    fontName?: string;
}

export interface QuizVideoData {
    type: "quiz";
    title: string;
    questions: string[];
    answers: string[];
    start_script: string;
    end_script: string;
    fontName?: string;
}

export interface RankVideoData {
    type: "rank";
    title: string;
    rankings: string[];
    images: string[];
    start_script: string;
    end_script: string;
    fontName?: string;
}

export interface RatherVideoData {
    type: "rather";
    title: string;
    questions: {
        option1: string;
        option2: string;
        p1: number;
        p2: number;
        image1: string;
        image2: string;
    }[];
    start_script: string;
    end_script: string;
    fontName?: string;
}

export interface TopicVideoData {
    type: "topic";
    title?: string;
    text: string;
    start_script: string;
    end_script: string;
    images: string[];
    fontName?: string;
    fontSize?: number;
}

export type VideoData = MessageVideoData | QuizVideoData | RankVideoData | RatherVideoData | TopicVideoData;
