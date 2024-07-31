// Copyright (c) 2024 Shafil Alam

// TODO: Finish test cases

import { checkResDir, genVideoWithJson } from '../src/index';
import { describe, expect, test } from '@jest/globals';

describe('genVideoWithJson', () => {
    test('JSON object without type should throw error', async () => {
        const error = async () => await genVideoWithJson(
            // @ts-ignore
            {bogus: "bogus"}, {}
        );
        await expect(error).rejects.toThrow("Invalid JSON data! Missing 'type' field.");
    });

    test('Null data should throw error', async () => {
        const error = async () => await genVideoWithJson(
            // @ts-ignore
            undefined, {}
        );

        await expect(error).rejects.toThrow("Empty JSON data!");
    });

    test('Empty string should throw error', async () => {
        const error = async () => await genVideoWithJson(
            // @ts-ignore
            "", {}
        );

        await expect(error).rejects.toThrow("Invalid JSON data!");
    });

    test('Invalid JSON should throw error', async () => {
        const error = async () => await genVideoWithJson(
            // @ts-ignore
            "{type: 'message'}", {}
        );

        await expect(error).rejects.toThrow("Invalid JSON data!");
    });

    // TODO: Make temp dir for resPath
    // test('Invalid type should throw error', async () => {
    //     const error = async () => await genVideoWithJson(
    //         // @ts-ignore
    //         {type: "bogus"}, {}
    //     );

    //     await expect(error).rejects.toThrow("Invalid video type!");
    // });
});
