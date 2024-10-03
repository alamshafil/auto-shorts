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
    /** Internal video generation options */
    internalOptions?: InternalVideoOptions;
    /** API Keys */
    apiKeys?: any; // TODO: Add API keys
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

// Default video options
export const defaultVideoOptions: VideoOptions = {
    aiType: "OllamaAIGen",
    aiModel: "llama3.2",
    voiceGenType: "BuiltinTTS",
    imageGenType: "GoogleScraperImageGen",
    orientation: "vertical",
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
    /** Internal video generation options */
    internalOptions?: InternalVideoOptions;
    /** API Keys */
    apiKeys?: any; // TODO: Add API keys
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
