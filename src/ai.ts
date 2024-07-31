// Copyright (c) 2024 Shafil Alam

import ollama from "ollama";

/**
 * AI generation types
 */
export enum AIGenType {
    GPTAIGen = "GPTAIGen",
    OllamaAIGen = "OllamaAIGen",
}

export interface OllamaOptions {
    model?: string;
}

/**
 * Base class for AI generation
 * @abstract
 */
export class AIGen {
    static async generate(log: (msg: string) => void, prompt: string) : Promise<string> {
        throw new Error("Method 'generate' must be implemented");
    }
}

// TODO: Implement AI generation using OpenAI API

/**
 * AI generation using OpenAI API
 */
export class GPTAIGen extends AIGen {
    /**
     * Generate AI text using OpenAI API
     * @param prompt - Prompt text
     * @returns AI generated text
     * @throws Error if API call fails
     */
    static async generate(log: (msg: string) => void, prompt: string) : Promise<string> {
        log(`TODO: Make GPTAIGen work`);
        return "TODO";
    }
}

/**
 * AI generation using Ollama API
 */
export class OllamaAIGen extends AIGen {
    /** Default model name */
    static DEFAULT_MODEL = "mistral";

    /**
     * Generate AI text using Ollama API
     * @param prompt - Prompt text
     * @param options - Ollama options
     * @returns AI generated text
     * @throws Error if API call fails
     */
    static async generate(log: (msg: string) => void, prompt: string, options?: OllamaOptions) : Promise<string> {
        let model = options?.model ?? this.DEFAULT_MODEL;
        log(`Calling Ollama API with model: ${model}`);

        let aiResponse = '';
        try {
            const message = { role: 'user', content: prompt }
            const response = await ollama.chat({ model: model, messages: [message], stream: true })
            for await (const part of response) {
                const msgChunk = part.message.content;
                aiResponse += msgChunk;
                log(`Response chunk: ${msgChunk.trim()}`);
            }
            return aiResponse;
        } catch (error: any) {
            log("Error while calling Ollama API: " + error.message);
            throw new Error("Error while calling Ollama API: " + error.message);
        }
    }
}
