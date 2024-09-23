// Copyright (c) 2024 Shafil Alam

import ollama, {ModelResponse} from "ollama";

/**
 * AI generation types
 */
export enum AIGenType {
    OpenAIGen = "OpenAIGen",
    GoogleAIGen = "GoogleAIGen",
    AnthropicAIGen = "AnthropicAIGen",
    OllamaAIGen = "OllamaAIGen",
}

export interface AIOptions {
    /** AI model name */
    model?: string;
    /** API endpoint (used only for OpenAI) */
    endpoint?: string;
}

/**
 * Base class for AI generation
 * @abstract
 */
export class AIGen {
    static async generate(log: (msg: string) => void, prompt: string) : Promise<string> {
        throw new Error("Method 'generate' must be implemented");
    }

    static async getModels() : Promise<string[]> {
        throw new Error("Method 'getModels' must be implemented");
    }
}

/**
 * AI generation using OpenAI API
 */
export class OpenAIGen extends AIGen {
    static DEFAULT_MODEL = "gpt-4o-mini";
    static DEFAULT_ENDPOINT = "https://api.openai.com/v1";

    /**
     * Generate AI text using OpenAI API
     * @param prompt - Prompt text
     * @param apiKey - OpenAI API key
     * @param options - OpenAI options
     * @returns AI generated text
     * @throws Error if API call fails
     */
    static async generate(log: (msg: string) => void, prompt: string, apiKey?: string, options?: AIOptions) : Promise<string> {
        const endpoint = options?.endpoint ?? this.DEFAULT_ENDPOINT;
        const model = options?.model ?? this.DEFAULT_MODEL;

        log(`Using OpenAI model: ${model}`);
        log(`Calling OpenAI API with endpoint: ${endpoint}`);

        if (apiKey == "" || apiKey == undefined) {
            log("[*] Warning: OpenAI API key is not set! Set via '--openaiAPIKey' flag.");
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };

        const data = {
            model: model,
            messages: [
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        };

        const response = await fetch(endpoint + "/chat/completions", {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to call OpenAI API: " + response.statusText);
        }

        const json = await response.json();

        const aiResponse = json.choices[0].message.content;

        log(`Response: ${aiResponse.trim()}`);

        return aiResponse;
    }

    /**
     * Get all OpenAI models
     * @param apiKey - OpenAI API key
     * @param options - OpenAI options
     * @returns List of OpenAI models
     * @throws Error if API call fails
     */
    static async getModels(apiKey?: string, options?: AIOptions) : Promise<string[]> {
        // Get all OpenAI models
        const endpoint = options?.endpoint ?? this.DEFAULT_ENDPOINT;

        if (apiKey == "" || apiKey == undefined) {
            console.info("[*] Warning: OpenAI API key is not set!");
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };

        const response = await fetch(endpoint + "/models", {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error("Failed to call OpenAI API: " + response.statusText);
        }

        const json = await response.json();

        const models = json.data.map((model: any) => model.id);

        return models;
    }
}

/**
 * AI generation using Google Gemini API
 */
export class GoogleAIGen extends AIGen {
    static DEFAULT_MODEL = "gemini-1.5-flash";
    static DEFAULT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";

    static async generate(log: (msg: string) => void, prompt: string, apiKey?: string, options?: AIOptions) : Promise<string> {
        const endpoint = this.DEFAULT_ENDPOINT;
        const model = options?.model ?? this.DEFAULT_MODEL;

        log(`Using Google AI model: ${model}`);
        log(`Calling Google AI API with endpoint: ${endpoint}`);

        if (apiKey == "" || apiKey == undefined) {
            throw Error("Google AI API key is not set! Set via '--googleaiAPIKey' flag.");
        }

        const headers = {
            'Content-Type': 'application/json',
        };

        const data = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        const url = `${endpoint}/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to call Google AI API: " + response.statusText);
        }

        const json = await response.json();

        const aiResponse = json.candidates[0].content;

        log(`Response: ${aiResponse.trim()}`);

        return aiResponse;
    }

    static async getModels() : Promise<string[]> {
        // Return list of Google Gemini AI models
        return [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "aqa"
        ];
    }
}

/**
 * AI generation using Anthropic AI
 */
export class AnthropicAIGen extends AIGen {
    static DEFAULT_MODEL = "claude-3-5-sonnet-20240620";
    static DEFAULT_ENDPOINT = "https://api.anthropic.com/v1";

    static async generate(log: (msg: string) => void, prompt: string, apiKey?: string, options?: AIOptions) : Promise<string> {
        const endpoint = this.DEFAULT_ENDPOINT;
        const model = options?.model ?? this.DEFAULT_MODEL;

        log(`Using Anthropic AI model: ${model}`);
        log(`Calling Anthropic AI API with endpoint: ${endpoint}`);

        if (apiKey == "" || apiKey == undefined) {
            throw Error("Anthropic AI API key is not set! Set via '--anthropicAPIKey' flag.");
        }

        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        };

        const data = {
            model: model,
            messages: [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        };

        const response = await fetch(endpoint + "/messages", {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to call Anthropic AI API: " + response.statusText);
        }

        const json = await response.json();

        const aiResponse = json.content[0].text;

        log(`Response: ${aiResponse.trim()}`);

        return aiResponse;
    }

    static async getModels() : Promise<string[]> {
        // Return list of Anthropic claude AI models
        return [
            "claude-3-5-sonnet-20240620",
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307"
        ];
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
    static async generate(log: (msg: string) => void, prompt: string, options?: AIOptions) : Promise<string> {
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

    /**
     * Get all Ollama models
     * @returns List of Ollama models
     * @throws Error if API call fails
     */
    static async getModels() : Promise<string[]> {
        // Get all Ollama models
        const response = await ollama.list();
        const models = response.models.map((model: ModelResponse) => model.name);

        return models;
    }
}
