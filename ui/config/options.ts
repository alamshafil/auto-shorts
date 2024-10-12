/**
 * Frontend model for video options
 */
export interface VideoOptions {
    /** AI Prompt */
    aiPrompt?: string;
    /** AI Type */
    aiType: string;
    /** AI Model */
    aiModel: string;
    /** OpenAI Endpoint */
    openAIEndpoint?: string;
    /** Voice generation type */
    voiceGenType: string; // TODO: Fix typing
    /** Image generation type */
    imageGenType: string; // TODO: Fix typing
    /** Video orientation */
    orientation: string;
    /** Custom background video path */
    vidPath?: string;
    /** Custom background music path */
    bgPath?: string;
    /** Use background music or not */
    useBgMusic?: boolean;
    /** Use background video or not */
    useBgVideo?: boolean;
    /** Internal video generation options */
    internalOptions?: InternalVideoOptions;
    /** Subtitle generation options */
    subtitleOptions?: SubtitleOptions;
    /** AI Image generation options */
    imageOptions?: AIImageGenOptions;
    /** TTS options */
    ttsOptions?: APIVoiceOptions;
}

/**
 * Frontend model for internal video options
 */
export interface InternalVideoOptions {
    /** Change photos or not */
    changePhotos: boolean;
    /** Disable TTS */
    disableTTS: boolean;
    /** Disable subtitles */
    disableSubtitles: boolean;
    /** Use mock data */
    useMock: boolean;
}

/**
 * Frontend model for subtitle options
 * (Note: same as backend model, so it is not separate)
 */
export interface SubtitleOptions {
    /** Maximum length for token */
    maxLen?: number;
    /** Font name */
    fontName?: string;
    /** Font size */
    fontSize?: number;
    /** Font color */
    fontColor?: string;
    /** Stroke color */
    strokeColor?: string;
    /** Stroke width */
    strokeWidth?: number;
}


/**
 * Options for AI image generation
 * (Note: same as backend model, so it is not separate)
 */
export interface AIImageGenOptions {
    /** Model name */
    modelName: string;
    /** Additional prompt */
    suffixPrompt: string;
}

/**
 * API voice generation options
 * (Note: same as backend model, so it is not separate)
 */
export interface APIVoiceOptions {
    /** Voice model */
    voiceModel?: string;
    /** Male voice model */
    maleVoice?: string;
    /** Female voice model */
    femaleVoice?: string;
}

// Default video options
export const defaultVideoOptions: VideoOptions = {
    aiType: "OllamaAIGen",
    aiModel: "llama3.2",
    voiceGenType: "BuiltinTTS",
    imageGenType: "GoogleScraper",
    orientation: "vertical",
    useBgMusic: true,
    useBgVideo: true,
    internalOptions: {
        changePhotos: true,
        disableTTS: false,
        disableSubtitles: false,
        useMock: false,
    },
};

// Backend models

export interface BackendVideoOptions {
    /** Temporary path to save files */
    tempPath: string;
    /** Resource path */
    resPath: string;
    /** Voice generation type */
    voiceGenType: any; // TODO: Fix typing
    /** Image generation type */
    imageGenType: any; // TODO: Fix typing
    /** Video orientation */
    orientation: string;
    /** Custom background video path */
    vidPath?: string;
    /** Custom background music path */
    bgPath?: string;
    /** Use background music or not */
    useBgMusic?: boolean;
    /** Use background video or not */
    useBgVideo?: boolean;
    /** Internal video generation options */
    internalOptions?: InternalVideoOptions;
    /** Subtitle generation options */
    subtitleOptions?: SubtitleOptions;
    /** API Keys */
    apiKeys?: any; // API keys already defined in the backend
}

export interface BackendInternalVideoOptions {
    /** 
     * Debug logging. 
     * If set to true, all output will be logged. 
     * If set to false, use event emitter 'log' to get output 
     */
    debug: boolean;
    /** Change photos or not */
    changePhotos: boolean;
    /** Disable TTS */
    disableTTS: boolean;
    /** Disable subtitles */
    disableSubtitles: boolean;
    /** Use mock data */
    useMock: boolean;
    /** Eleven Labs options */
    elevenLabsOptions?: any; // TODO: Add Eleven Labs options
    /** Neets TTS options */
    neetsTTSOptions?: any; // TODO: Add Neets TTS options
}
