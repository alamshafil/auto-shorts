#!/usr/bin/env node

import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { pipeline } from 'stream';
import { promisify } from 'util';
import type { ReadableStream } from "stream/web";
import cliProgress from 'cli-progress';
import extract from "extract-zip";

const BASE_MODELS_URL = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main";

export const GGML_MODELS = {
	tiny: `${BASE_MODELS_URL}/ggml-tiny.bin`,
	"tiny.en": `${BASE_MODELS_URL}/ggml-tiny.en.bin`,
	small: `${BASE_MODELS_URL}/ggml-small.bin`,
	"small.en": `${BASE_MODELS_URL}/ggml-small.en.bin`,
	base: `${BASE_MODELS_URL}/ggml-base.bin`,
	"base.en": `${BASE_MODELS_URL}/ggml-base.en.bin`,
	medium: `${BASE_MODELS_URL}/ggml-medium.bin`,
	"medium.en": `${BASE_MODELS_URL}/ggml-medium.en.bin`,
	"large-v1": `${BASE_MODELS_URL}/ggml-large-v1.bin`,
	"large-v2": `${BASE_MODELS_URL}/ggml-large-v2.bin`,
	"large-v3": `${BASE_MODELS_URL}/ggml-large-v3.bin`,
} as const;

export type ModelName = keyof typeof GGML_MODELS;

export default async function download(resPath: string) {
    resPath = path.resolve(resPath);

    console.info(`Downloading resources to ${resPath}`);

    // Create res directory if it doesn't exist
    if (!fs.existsSync(resPath)) {
        fs.mkdirSync(resPath, { recursive: true });
        console.info(`Created resources directory: ${resPath}`);
    }

    // Create models directory if it doesn't exist
    const modelsDir = path.join(resPath, "models");
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
        console.info(`Created models directory: ${modelsDir}`);
    }

    await download_ggml(resPath);

    await download_res_zip(resPath);
}

const pipelineAsync = promisify(pipeline);

async function download_ggml(resPath: string) {
    let url = "";

    url = GGML_MODELS["base.en"];

    console.info(`Downloading GGML model 'base.en' for whisper subtitles...`);

    if (!url) {
        throw new Error(`Invalid model URL: ${url}`);
    }

    const res = await fetch(url);
    if (!res.ok || !res.body) {
        throw new Error(`Failed to download model: ${res.statusText}`);
    }

    const totalSize = (parseInt(res.headers.get('content-length') || '0', 10));
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.info(`File size is ${totalSizeMB} MB...`);
    const filePath = path.join(resPath, "models", "ggml-base.en.bin");
    const stream = fs.createWriteStream(filePath);

    const progressBar = new cliProgress.Bar({
        format: 'Downloading [{bar}] {percentage}% | {speed} MB/s | {downloaded}/{total} MB',
    }, cliProgress.Presets.shades_classic);

    progressBar.start(totalSize, 0, {
        speed: "N/A",
        downloaded: "0",
        total: totalSizeMB
    });

    let downloaded = 0;
    const startTime = Date.now();

    const nodeStream = Readable.fromWeb(res.body as ReadableStream<Uint8Array>);

    nodeStream.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const speed = ((downloaded / (1024 * 1024)) / elapsedTime).toFixed(2);
        progressBar.update(downloaded, {
            speed,
            downloaded: (downloaded / (1024 * 1024)).toFixed(2)
        });
    });

    await pipelineAsync(nodeStream, stream);

    progressBar.stop();
    console.info(`Downloaded model to 'models/ggml-base.en.bin'`);
}

async function download_res_zip(resPath: string) {
    const url = "https://github.com/alamshafil/auto-shorts/releases/download/v0.1.0/resources.zip";

    console.info(`Downloading resources zip file...`);

    const res = await fetch(url);
    if (!res.ok || !res.body) {
        throw new Error(`Failed to download resources zip file: ${res.statusText}`);
    }

    const totalSize = (parseInt(res.headers.get('content-length') || '0', 10));
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.info(`File size is ${totalSizeMB} MB...`);
    const filePath = path.join(resPath, "resources.zip");
    const stream = fs.createWriteStream(filePath);

    const progressBar = new cliProgress.Bar({
        format: 'Downloading [{bar}] {percentage}% | {speed} MB/s | {downloaded}/{total} MB',
    }, cliProgress.Presets.shades_classic);

    progressBar.start(totalSize, 0, {
        speed: "N/A",
        downloaded: "0",
        total: totalSizeMB
    });

    let downloaded = 0;
    const startTime = Date.now();

    const nodeStream = Readable.fromWeb(res.body as ReadableStream<Uint8Array>);

    nodeStream.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const speed = ((downloaded / (1024 * 1024)) / elapsedTime).toFixed(2);
        progressBar.update(downloaded, {
            speed,
            downloaded: (downloaded / (1024 * 1024)).toFixed(2)
        });
    });

    await pipelineAsync(nodeStream, stream);

    progressBar.stop();

    console.info(`Downloaded resources zip file to '${filePath}'`);

    console.info(`Extracting resources zip file...`);

    await extract(filePath, { dir: resPath });

    console.info(`Extracted resources to '${resPath}'`);

    // Remove zip file
    fs.unlinkSync(filePath);

    console.info(`Removed resources zip file`);

    console.info(`Resources download completed!`);
}
