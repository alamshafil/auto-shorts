// Copyright (c) 2024 Shafil Alam

import { VideoGen } from "./videogen";
import { Client } from "node-pexels";
import puppeteer from "puppeteer";
import axios from "axios";
import fs from "fs";
import path from "path";

/**
 * Image generation types
 **/
export enum ImageGenType {
    PexelsImageGen = "PexelsImageGen",
    GoogleScraperImageGen = "GoogleScraperImageGen",
}

/**
 * Base class for image generation
 * @abstract
 */
export class ImageGen {
    static async generateImages(gen: VideoGen, images: string[], tempPath: string, changePhotos: boolean) : Promise<string[]> {
        throw new Error("Method 'generateImage' must be implemented");
    }
}

/**
 * Image generation using Pexels API
 */
export class PexelsImageGen extends ImageGen {

    /**
     * Generate images using Pexels API
     * @param images - List of image queries
     * @param tempPath - Temporary path to save images
     * @param changePhotos - Change photos or not
     * @param apiKey - Pexels API key (required)
     * @param filePrefix - File prefix for images
     * @returns List of image paths
     */
    static async generateImages(gen: VideoGen, images: string[], tempPath: string, changePhotos: boolean, apiKey?: string, filePrefix?: string) : Promise<string[]> {
        if (!apiKey) {
            throw new Error("Pexels API key required");
        }

        const client = new Client({ apiKey: apiKey });
        const imgs: string[] = [];
    
        for (const [index, _] of images.entries()) {
            if (changePhotos) {
                const query = images[index];
                gen.log(`Searching for images for rank ${index + 1} with query: ${query}`);
    
                const r_images_rep = await client.v1.photos.search(query, { perPage: 1, page: 1 });
                const r_image1 = r_images_rep.photos[0].src.large;
    
                // Download images with axios
                const r_image_path = path.join(tempPath, `image-${filePrefix ?? index}.png`);
    
                const image_response = await axios.get(r_image1, { responseType: 'arraybuffer' });
                fs.writeFileSync(r_image_path, image_response.data);
    
                imgs.push(r_image_path);
    
                gen.log(`Image for rank ${index + 1} downloaded successfully at ${r_image_path}`);
            } else {
                const r_image_path = path.join(tempPath, `image-${filePrefix ?? index}.png`);
    
                imgs.push(r_image_path);
        
                gen.log(`Image for rank ${index + 1} downloaded successfully at ${r_image_path}`);
            }
        }
        
        return imgs;
    }
}

/**
 * Image generation using Google
 */
export class GoogleScraperImageGen extends ImageGen {

    /**
     * Generate images using Google
     * @param images - List of image queries
     * @param tempPath - Temporary path to save images
     * @param changePhotos - Change photos or not
     * @param filePrefix - File prefix for images
     * @returns List of image paths
     */
    static async generateImages(gen: VideoGen, images: string[], tempPath: string, changePhotos: boolean, filePrefix?: string) : Promise<string[]> {
        const imgs: string[] = [];

        if (changePhotos) {
            const urls = await this.imgScrape(images);
            for (const [index, url] of urls?.entries() ?? []) {
                const img_path = path.join(tempPath, `image-${filePrefix ?? index}.png`);

                const base64Data = url.replace(/^data:image\/(png|jpeg|gif);base64,/, '');
                fs.writeFileSync(img_path, base64Data, 'base64');

                gen.log(`Image generated: ${img_path} - GoogleScraperImageGen`);

                imgs.push(img_path);
            }
        } else {
            for (const [index, _] of images.entries()) {
                const img_path = path.join(tempPath, `image-${filePrefix ?? index}.png`);
                gen.log(`Image added: ${img_path}`);
                imgs.push(img_path);
            }
        }

        return imgs;
    }
    
    private static async imgScrape(queries: string[]) {
        try {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            const images = [];
            for (const query of queries) {
                await page.goto(`https://www.google.com/search?tbm=isch&q=${query}`);

                // Scroll to the bottom of the page to load more images
                await page.evaluate(async () => {
                    for (let i = 0; i < 1; i++) {
                        window.scrollBy(0, window.innerHeight);
                        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for more images to load
                    }
                });

                // Wait for images to be loaded
                await page.waitForSelector('img');

                // Extract image URLs
                const urls = await page.evaluate(() => {
                    const imageElements = document.querySelectorAll('img');
                    const urls: string[] = [];
                    imageElements.forEach(img => {
                        const url = img.src;
                        if (url.startsWith('data')) {
                            urls.push(url);
                        }
                    });
                    return urls.slice(0, 1); // Limit to first 1 image URLs
                });

                images.push(...urls);
            }

            await browser.close();
            return images;

        } catch (err) {
            console.error('An error occurred:', err);
        }
    }
}
