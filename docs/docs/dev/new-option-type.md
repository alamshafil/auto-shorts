---
sidebar_position: 3
---

# Implementing a New Option Type

This guide will walk you through the process of implementing a new option type for the video generation process.

## Define the Option Type in VideoOptions interface

First, you need to define the new option type in the `VideoOptions` interface. The `VideoOptions` interface is defined in the `videogen.ts` file in the `src` directory.

```typescript title="src/videogen.ts"
export interface VideoOptions {
    // ... (continued)
    /** Internal video generation options */
    internalOptions?: InternalVideoOptions;
    /** Subtitle generation options */
    subtitleOptions?: SubtitleOptions;
    /** AI image generation options */
    imageOptions?: img.AIImageGenOptions;
    /** TTS options */
    ttsOptions?: tts.APIVoiceOptions;
    // ... (continued)
}
```
Let's say you want to add a new option type called `soundOptions`. First define an interface for the new option type.

```typescript title="src/videogen.ts"
// Example sound options interface
export interface SoundOptions {
    /** Sound volume */
    volume: number;
    /** Sound duration */
    duration: number;
}
```

Then, add the new option type to the `VideoOptions` interface.

```typescript title="src/videogen.ts"
export interface VideoOptions {
    // ... (continued)
    /** Sound generation options */
    soundOptions?: SoundOptions;
    // ... (continued)
}
```

## Implement the Option Type CLI

Next, you need to implement the CLI for the new option type. The CLI is defined in the `cli.ts` file in the `src` directory.

There are multiple steps to implement the CLI for the new option type:

### 1. Define the command line option for the new option type.

```typescript title="src/cli.ts"
const soundOptions = [
    {
        name: 'soundVolume',
        type: Number,
        description: 'Sound volume'
    },
    {
        name: 'soundDuration',
        type: Number,
        description: 'Sound duration'
    }
];
```
### 2. Add a new header in CLI help text for the new option type.

```typescript title="src/cli.ts"
 const sections = [
        {
            header: 'AutoShorts AI video generator (CLI Edition)',
            content: 'Generate AI videos of different types based on a prompt.'
        },
        {
            header: 'Options',
            optionList: mainOptions
        },
        // Add a new header for the new option type
        {
            header: 'Sound Options',
            optionList: soundOptions
        }
        // ... (continued)
    ];
```

### 3. Parse the new option type in the CLI.

```typescript title="src/cli.ts"
// TTS options
let ttsMaleVoice = options.ttsMaleVoice ?? null;
let ttsFemaleVoice = options.ttsFemaleVoice ?? null;
let ttsVoiceModel = options.ttsVoiceModel ?? null;

// Add the new options here
let soundVolume = options.soundVolume ?? 100; // Use default value if not provided OR make it nullable and handle null value later
let soundDuration = options.soundDuration ?? 10;
```

### 4. (Optional) Log the new option type in the CLI.

```typescript title="src/cli.ts"
// Log the options
console.log("\n--> Image AI options:");
console.info("Image AI model: " + (imgAIModel ?? "Default"));
console.info("Image AI prompt: " + (imgAIPrompt ?? "Default"));

// Add the new options here
console.log("\n--> Sound options:");
console.info("Sound volume: " + soundVolume);
console.info("Sound duration: " + soundDuration);
```

### 5. Add the new options to saving and loading the options.

#### Saving the new options
```typescript title="src/cli.ts"
if (useAdvancedOptions) {
    // ... (continued)

    // Log previous TTS options
    console.info("--> Using previous TTS options:");
    console.info("Male voice: " + (jsonData.ttsMaleVoice ?? "Default"));
    console.info("Female voice: " + (jsonData.ttsFemaleVoice ?? "Default"));
    console.info("Voice model: " + (jsonData.ttsVoiceModel ?? "Default"));

    // Add the new options here
    console.info("--> Using previous sound options:");
    console.info("Sound volume: " + (jsonData.soundVolume ?? 100));
    console.info("Sound duration: " + (jsonData.soundDuration ?? 10));

    // Set previous TTS options
    ttsMaleVoice = jsonData.ttsMaleVoice;
    ttsFemaleVoice = jsonData.ttsFemaleVoice;
    ttsVoiceModel = jsonData.ttsVoiceModel;

    // Add the new options here
    soundVolume = jsonData.soundVolume;
    soundDuration = jsonData.soundDuration;

    // ... (continued)
}
```

#### Loading the new options
```typescript title="src/cli.ts"
if (useAdvancedOptions && !usePrev) {

    // ... (continued)

    // Ask for image AI options
    console.info("[*] Asking for image AI options (leave empty for default):");

    const imgAIModelRep = await input({ message: `Image AI model? -> ` });
    const imgAIPromptRep = await input({ message: `Image AI prompt? -> ` });

    imgAIModel = imgAIModelRep !== "" ? imgAIModelRep : imgAIModel;
    imgAIPrompt = imgAIPromptRep !== "" ? imgAIPromptRep : imgAIPrompt;

    // Add the new options here
    console.info("[*] Asking for sound options (leave empty for default):");

    const soundVolumeRep = await input({ message: `Sound volume? -> ` });
    const soundDurationRep = await input({ message: `Sound duration? -> ` });

    soundVolume = soundVolumeRep !== "" ? parseInt(soundVolumeRep) : soundVolume;
    soundDuration = soundDurationRep !== "" ? parseInt(soundDurationRep) : soundDuration;

    // Print image AI options
    console.info("--> Image AI options:");
    console.info("Image AI model: " + (imgAIModel ?? "Default"));
    console.info("Image AI prompt: " + (imgAIPrompt ?? "Default"));

    // Add the new options here
    console.info("--> Sound options:");
    console.info("Sound volume: " + soundVolume);
    console.info("Sound duration: " + soundDuration);

    // Save to file
        const data = {
            // ... (continued)
            // Image options
            imgAIModel: imgAIModel,
            imgAIPrompt: imgAIPrompt,
            // Add the new options here
            soundVolume: soundVolume,
            soundDuration: soundDuration,
            // ... (continued)
        };

    // ... (continued)

}
```

### 6. Add the new options to the `VideoOptions` object.

```typescript title="src/cli.ts"
  // Generate video based on user comment
    const vidOptions: VideoOptions = {
        // ... (continued)
        soundOptions: {
            volume: soundVolume,
            duration: soundDuration
        }
        // ... (continued)
    }
```

Now you have successfully implemented the CLI for the new option type.

## Implement the Option Type in server

Next, you need to implement the new option type in the server. The server is defined in the `server.ts` file in the `src` directory. You will need to do this to use new option types in GUI.

### 1. Update the `VideoOptions` object in the server.

```typescript title="src/server.ts"
/**
 * Frontend model for video options
 */
export interface FrontendVideoOptions {
    // ... (continued)
    soundOptions?: SoundOptions;
    // ... (continued)
}
```

### 2. Update the API endpoint to use the new option type.

```typescript title="src/server.ts"
app.post(`${root}/generateAIJSON`, async (req, res) => {
    // ... (continued)
    {
        ttsOptions: data.ttsOptions,
        // Add the new options here
        soundOptions: data.soundOptions,
    }
    // ... (continued)
});

app.post(`${root}/generateVideo`, async (req, res) => {
    // ... (continued)
    {
        ttsOptions: options.ttsOptions,
        // Add the new options here
        soundOptions: options.soundOptions,
    }
    // ... (continued)
});
```

You have now successfully implemented the new option type in the server.

## Implement the Option Type in the GUI

Next, you need to implement the new option type in the GUI. The GUI is defined in the `ui` directory.

### 1. Define the new option type in the `VideoOptions` and `BackendVideoOptions` interface.

```typescript title="ui/config/options.ts"
export interface VideoOptions {
    // ... (continued)
    soundOptions?: SoundOptions;
    // ... (continued)
}

export interface BackendVideoOptions {
    // ... (continued)
    soundOptions?: SoundOptions;
    // ... (continued)
}
```

### 2. Add the new option type to the UI

#### Add useState hooks for the new option type members.

```typescript title="ui/components/options.tsx"
// ... (continued)

// AI Image options
const [aiImageModel, setAiImageModel] = useState('');
const [aiImagePrompt, setAiImagePrompt] = useState('');

// Add the new options here
const [soundVolume, setSoundVolume] = useState(100);
const [soundDuration, setSoundDuration] = useState(10);

// ... (continued)
```

#### Add UI elements for the new option type.

The following code snippet shows how to add UI elements for the new option type.

```tsx title="ui/components/options.tsx"
// ... (continued)

        <div className="flex items-center gap-2">
                <FaTextWidth />
                <h1 className={title()}>Sound Options</h1>
            </div>
            <Divider />
            <div className="space-y-4 mb-8">
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Sound Volume</p>
                        <p className={subtitle({ size: 'sm' })}>Volume of the sound</p>
                    </div>
                    <Input startContent={<FaVolumeUp />} isClearable placeholder="Enter sound volume" className="w-56" onChange={(e) => setSoundVolume(parseInt(e.target.value) ?? 100)} />
                </div>
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Sound Duration</p>
                        <p className={subtitle({ size: 'sm' })}>Duration of the sound</p>
                    </div>
                    <Input startContent={<FaClock />} isClearable placeholder="Enter sound duration" className="w-56" onChange={(e) => setSoundDuration(parseInt(e.target.value) ?? 10)} />
                </div>
            </div>

// ... (continued)
```

### 3. Update the `setAdvancedOptions` function to include the new option type.

```typescript title="ui/components/options.tsx"
// ... (continued)

setAdvancedOptions({
    imageOptions: {
        modelName: aiImageModel,
        suffixPrompt: aiImagePrompt
    },
    // Add the new options here
    soundOptions: {
        volume: soundVolume,
        duration: soundDuration
    }
})

// ... (continued)
```

You have now successfully implemented the new option type in the GUI.

## Conclusion

In this guide, you learned how to implement a new option type for the video generation process. You defined the new option type in the `VideoOptions` interface, implemented the CLI for the new option type, implemented the new option type in the server, and implemented the new option type in the GUI. You can now use the new option type in the video generation process. The option will be exposed in `VideoOptions` object and can be used in the video generation process.
