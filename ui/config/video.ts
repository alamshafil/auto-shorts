export interface MessageVideoData {
    type: "message";
    contactname: string;
    script: {
        voice: "male" | "female";
        message: string;
        msgtype: "receiver" | "sender";
    }[];
    extra: string;
}

export interface QuizVideoData {
    type: "quiz";
    title: string;
    questions: { question: string; answer: string }[];
    start_script: string;
    end_script: string;
}

export interface RankVideoData {
    type: "rank";
    title: string;
    rankings: string[];
    images: string[];
    start_script: string;
    end_script: string;
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
}

export interface TopicVideoData {
    type: "topic";
    title?: string;
    text: string;
    start_script: string;
    end_script: string;
    images: string[];
    imgOverride?: string[];
}

export type VideoData = MessageVideoData | QuizVideoData | RankVideoData | RatherVideoData | TopicVideoData;
