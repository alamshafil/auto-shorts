import React, { useEffect, useState } from 'react';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/modal';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import { Checkbox } from '@nextui-org/checkbox';
import { Input } from '@nextui-org/input';
import { Button, ButtonGroup } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Chip } from '@nextui-org/chip';
import { Tooltip } from '@nextui-org/tooltip';

import { BACKEND_ENDPOINT } from '@/config/backend';
import { title, subtitle } from '@/components/primitives';
import { VideoOptions } from '@/config/options';

import { FaAngleDown, FaExclamationTriangle, FaGlobe, FaPhotoVideo, FaRandom, FaRegFileVideo, FaRobot, FaSave, FaSlidersH, FaSync, FaTextHeight, FaVideo, FaVolumeUp } from 'react-icons/fa';

const config = {
    aiOptions: {
        types: [
            {
                "name": "Ollama (Local LLMs)",
                "description": "Local LLMs (llama3.2, etc.) via Ollama (local/free)",
                "type": "OllamaAIGen",
            },
            {
                "name": "OpenAI",
                "description": "OpenAI models GPT-4, o1, etc. (API key required)",
                "type": "OpenAIGen",
            },
            {
                "name": "Anthropic (Claude)",
                "description": "Anthropic's Claude AI models (API key required)",
                "type": "AnthropicAIGen",
            },
            {
                "name": "Google Gemini",
                "description": "Google Gemini AI models (API key required)",
                "type": "GoogleAIGen",
            }
        ]
    },
    ttsOptions: [
        {
            "name": "Local Built-in TTS",
            "description": "Local built-in TTS (local/free)",
            "type": "BuiltinTTS",
        },
        {
            "name": "ElevenLabs",
            "description": "ElevenLabs advanced high-quality TTS (API key required)",
            "type": "ElevenLabsTTS",
        },
        {
            "name": "Neets.ai",
            "description": "Neets.ai TTS (cheaper but less quality) (API key required)",
            "type": "NeetsTTS",
        }
    ],
    imageTypes: [
        {
            "name": "Google Search",
            "description": "Google image search (scraping) (local/free)",
            "type": "GoogleScraperImageGen",
        },
        {
            "name": "Pexels",
            "description": "Pexels image search (API key required)",
            "type": "PexelsImageGen",
        },
    ],
    subtitleOptions: [
        {
            "name": "Whisper (en-tiny)",
            "description": "Whisper AI speech-to-text model (en-tiny) (local/free)",
            "type": "whisper-en-tiny",
        }
    ],
    videoOptions: {
        orientations: ['Vertical', 'Horizontal']
    },
    miscOptions: [
        {
            name: 'changePhotos',
            fullName: 'Change Photos',
            defaultValue: true,
            description: 'Change photos in video. Used to prevent overriding wanted photos. (default: true)'
        },
        {
            name: 'disableTTS',
            fullName: 'Disable TTS',
            defaultValue: false,
            description: 'Disable TTS in video. Used to prevent overriding wanted TTS. (default: false)'
        },
        {
            name: 'disableSubtitles',
            fullName: 'Disable Subtitles',
            defaultValue: false,
            description: 'Disable subtitles in video. (default: false)'
        },
        {
            name: 'useMock',
            fullName: 'Use internal testing mock data',
            defaultValue: false,
            description: 'Use mock JSON data. (default: false)'
        },
    ]
};

export default function AdvancedOptions({ setAdvancedOptions }: { setAdvancedOptions: React.Dispatch<React.SetStateAction<VideoOptions>> }) {
    // Modals
    const modelModal = useDisclosure();
    const bgVideoModal = useDisclosure();
    const bgAudioModal = useDisclosure();

    // TODO: Use server-side to fetch data instead of client-side; improve error handling

    // AI Model fetch
    const [aiModels, setAiModels] = useState<string[]>([]);
    const [isAiModelError, setIsAiModelError] = useState('');
    const [selectedAIModel, setSelectedAIModel] = useState('');

    async function fetchModels(aiType: string = selectedAIType.type) {
        console.log('Fetching AI models... Type: ' + aiType);
        setIsAiModelError('');

        try {
            let res = await fetch(`${BACKEND_ENDPOINT}/types/ai/models?type=${aiType}`)

            let data = await res.json()

            // Check if response is ok
            if (!res.ok) {
                setIsAiModelError('Failed to fetch AI models: ' + (data.error ?? data.toString()))
                return;
            }

            setAiModels(data.models)
            setSelectedAIModel(data.models[0])
        } catch (e: any) {
            setIsAiModelError('Failed to fetch AI models due to internal error: ' + (e.message ?? e.toString()));
        }
    }

    // Background video fetch
    const [bgVideos, setBgVideos] = useState<string[]>([]);
    const [isBgVideosError, setIsBgVideosError] = useState('');
    const [selectedBgVideo, setSelectedBgVideo] = useState('');

    async function fetchBgVideos() {
        console.log('Fetching background videos...');
        setIsBgVideosError('');

        try {
            let res = await fetch(`${BACKEND_ENDPOINT}/types/backgrounds`)

            let data = await res.json()

            // Check if response is ok
            if (!res.ok) {
                setIsBgVideosError('Failed to fetch background videos: ' + (data.error ?? data.toString()))
                return;
            }

            setBgVideos(data.videos)
            setSelectedBgVideo(data.videos[0])
        } catch (e: any) {
            setIsBgVideosError('Failed to fetch background videos due to internal error: ' + (e.message ?? e.toString()));
        }
    }

    // Background audio fetch
    const [bgAudio, setBgAudio] = useState<string[]>([]);
    const [isBgAudioError, setIsBgAudioError] = useState('');
    const [selectedBgAudio, setSelectedBgAudio] = useState('');

    async function fetchBgAudio() {
        console.log('Fetching background audio...');
        setIsBgAudioError('');

        try {
            let res = await fetch(`${BACKEND_ENDPOINT}/types/bgaudio`)

            let data = await res.json()

            // Check if response is ok
            if (!res.ok) {
                setIsBgAudioError('Failed to fetch background audio: ' + (data.error ?? data.toString()))
                return;
            }

            setBgAudio(data.audios)
            setSelectedBgAudio(data.audios[0])
        } catch (e: any) {
            setIsBgAudioError('Failed to fetch background audio due to internal error: ' + (e.message ?? e.toString()));
        }
    }

    // State
    const [selectedAIType, setSelectedAIType] = useState(config.aiOptions.types[0]);
    const [selectedTTSProvider, setSelectedTTSProvider] = useState(config.ttsOptions[0]);
    const [selectedImageType, setSelectedImageType] = useState(config.imageTypes[0]);
    const [selectedSubtitleModel, setSelectedSubtitleModel] = useState(config.subtitleOptions[0]);
    const [selectedOrientation, setSelectedOrientation] = useState(config.videoOptions.orientations[0]);
    const [miscOptions, setMiscOptions] = useState(config.miscOptions.map(option => option.defaultValue));

    useEffect(() => {
        fetchModels();
        fetchBgVideos();
        fetchBgAudio();
    }, [])

    return (
        <div>
            <div className="flex items-center gap-2">
                <FaRobot />
                <h1 className={title()}>AI Options</h1>
            </div>
            <Divider />
            <div className="space-y-4 mb-8">
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Choose AI Type</p>
                        <p className={subtitle({ size: 'sm' })}>Select the type of AI to use</p>
                    </div>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button endContent={<FaAngleDown />}>{selectedAIType.name}</Button>
                        </DropdownTrigger>

                        <DropdownMenu onAction={(key) => {
                            setSelectedAIType(config.aiOptions.types.find(type => type.type === key)!)
                            fetchModels(key.toString())
                        }}>
                            {config.aiOptions.types.map(type => <DropdownItem key={type.type} description={type.description}>{type.name}</DropdownItem>)}
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Choose AI Model</p>
                        <p className={subtitle({ size: 'sm' })}>Select the AI model</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <ButtonGroup>
                            {isAiModelError
                                ? <>
                                    <Button color='danger' variant='shadow' startContent={<FaExclamationTriangle />} onPress={modelModal.onOpen}>
                                        Failed to fetch models
                                    </Button>
                                    <Modal isOpen={modelModal.isOpen} onOpenChange={modelModal.onOpenChange}>
                                        <ModalContent>
                                            {(onClose) => (
                                                <>
                                                    <ModalHeader className="flex flex-col gap-1">Erorr fetching models</ModalHeader>
                                                    <ModalBody>
                                                        <p>{isAiModelError}</p>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="danger" variant="light" onPress={onClose}>
                                                            Close
                                                        </Button>
                                                    </ModalFooter>
                                                </>
                                            )}
                                        </ModalContent>
                                    </Modal>
                                </>
                                : <Dropdown>
                                    <DropdownTrigger>
                                        <Button isLoading={selectedAIModel == ""} startContent={<FaRobot />} endContent={<FaAngleDown />}>{
                                            selectedAIModel == "" ? "Loading models" : selectedAIModel
                                        }</Button>
                                    </DropdownTrigger>

                                    <DropdownMenu onAction={(key) => setSelectedAIModel(key.toString())}>
                                        {aiModels.map(model => <DropdownItem key={model}>{model}</DropdownItem>)}
                                    </DropdownMenu>
                                </Dropdown>
                            }
                            <Tooltip content="Fetch AI models">
                                <Button isIconOnly onClick={() => fetchModels()}><FaSync /></Button>
                            </Tooltip>
                        </ButtonGroup>
                    </div>
                </div>
                {selectedAIType.type === 'OpenAIGen' && (
                    <div className="flex justify-between my-4">
                        <div>
                            <p className={title({ size: 'sm' })}>API Endpoint</p>
                            <p className={subtitle({ size: 'sm' })}>Custom OpenAI compliant endpoint</p>
                        </div>
                        <Input startContent={<FaGlobe />} isClearable placeholder="Enter API Endpoint" className="w-96" />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <FaTextHeight />
                <h1 className={title()}>TTS Options</h1>
            </div>
            <Divider />
            <div className="space-y-4 mb-8">
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Choose TTS Provider</p>
                        <p className={subtitle({ size: 'sm' })}>Select the TTS provider</p>
                    </div>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button endContent={<FaAngleDown />}>{selectedTTSProvider.name}</Button>
                        </DropdownTrigger>

                        <DropdownMenu onAction={(key) => setSelectedTTSProvider(config.ttsOptions.find(provider => provider.type === key)!)}>
                            {config.ttsOptions.map(provider => <DropdownItem key={provider.type} description={provider.description}>{provider.name}</DropdownItem>)}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <FaPhotoVideo />
                <h1 className={title()}>Image</h1>
            </div>
            <Divider />
            <div className="space-y-4 mb-8">
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Choose image provider</p>
                        <p className={subtitle({ size: 'sm' })}>Select the image search provider</p>
                    </div>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button endContent={<FaAngleDown />}>{selectedImageType.name}</Button>
                        </DropdownTrigger>

                        <DropdownMenu onAction={(key) => setSelectedImageType(config.imageTypes.find(provider => provider.type === key)!)}>
                            {config.imageTypes.map(provider => <DropdownItem key={provider.type} description={provider.description}>{provider.name}</DropdownItem>)}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <FaRegFileVideo />
                <h1 className={title()}>Subtitle Options</h1>
            </div>
            <Divider />
            <div className="space-y-4 mb-8">
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Choose Subtitle Model</p>
                        <p className={subtitle({ size: 'sm' })}>Select the subtitle model</p>
                    </div>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button endContent={<FaAngleDown />}>{selectedSubtitleModel.name}</Button>
                        </DropdownTrigger>

                        <DropdownMenu onAction={(key) => setSelectedSubtitleModel(config.subtitleOptions.find(model => model.type === key)!)}>
                            {config.subtitleOptions.map(model => <DropdownItem key={model.type} description={model.description}>{model.name}</DropdownItem>)}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <FaVideo />
                <h1 className={title()}>Video Options</h1>
            </div>
            <Divider />
            <div className="space-y-4 mb-8">
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Choose Video Background</p>
                        <p className={subtitle({ size: 'sm' })}>Select the video background</p>
                    </div>
                    <ButtonGroup>
                        <Dropdown>
                            {
                                isBgVideosError
                                    ? <>
                                        <Button color='danger' variant='shadow' startContent={<FaExclamationTriangle />} onPress={bgVideoModal.onOpen}>
                                            Failed to fetch videos
                                        </Button>
                                        <Modal isOpen={bgVideoModal.isOpen} onOpenChange={bgVideoModal.onOpenChange}>
                                            <ModalContent>
                                                {(onClose) => (
                                                    <>
                                                        <ModalHeader className="flex flex-col gap-1">Erorr fetching videos</ModalHeader>
                                                        <ModalBody>
                                                            <p>{isBgVideosError}</p>
                                                        </ModalBody>
                                                        <ModalFooter>
                                                            <Button color="danger" variant="light" onPress={onClose}>
                                                                Close
                                                            </Button>
                                                        </ModalFooter>
                                                    </>
                                                )}
                                            </ModalContent>
                                        </Modal>
                                    </>
                                    : <DropdownTrigger>
                                        <Button isLoading={selectedBgVideo == ""} startContent={<FaVideo />} endContent={<FaAngleDown />}>{selectedBgVideo == "" ? "Loading backgrounds" : selectedBgVideo}</Button>
                                    </DropdownTrigger>
                            }

                            <DropdownMenu className="max-h-[50vh] overflow-y-auto" onAction={(key) => setSelectedBgVideo(key.toString())}>
                                {bgVideos.map(bg => <DropdownItem key={bg} startContent={<FaVideo />}>{bg}</DropdownItem>)}
                            </DropdownMenu>
                        </Dropdown>
                        <Tooltip content="Fetch background videos">
                            <Button isIconOnly onClick={() => fetchBgVideos()}><FaSync /></Button>
                        </Tooltip>
                        <Tooltip content="Random background video">
                            <Button isIconOnly onClick={() => setSelectedBgVideo(bgVideos[Math.floor(Math.random() * bgVideos.length)])}><FaRandom /></Button>
                        </Tooltip>
                    </ButtonGroup>
                </div>
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Choose Sound</p>
                        <p className={subtitle({ size: 'sm' })}>Select the sound</p>
                    </div>
                    <ButtonGroup>
                        <Dropdown>
                            {
                                isBgAudioError
                                    ? <>
                                        <Button color='danger' variant='shadow' startContent={<FaExclamationTriangle />} onPress={bgAudioModal.onOpen}>
                                            Failed to fetch audio
                                        </Button>
                                        <Modal isOpen={bgAudioModal.isOpen} onOpenChange={bgAudioModal.onOpenChange}>
                                            <ModalContent>
                                                {(onClose) => (
                                                    <>
                                                        <ModalHeader className="flex flex-col gap-1">Erorr fetching audio</ModalHeader>
                                                        <ModalBody>
                                                            <p>{isBgAudioError}</p>
                                                        </ModalBody>
                                                        <ModalFooter>
                                                            <Button color="danger" variant="light" onPress={onClose}>
                                                                Close
                                                            </Button>
                                                        </ModalFooter>
                                                    </>
                                                )}
                                            </ModalContent>
                                        </Modal>
                                    </>
                                    : <DropdownTrigger>
                                        <Button isLoading={selectedBgAudio == ""} startContent={<FaVolumeUp />} endContent={<FaAngleDown />}>{selectedBgAudio == "" ? "Loading sounds" : selectedBgAudio}</Button>
                                    </DropdownTrigger>
                            }

                            <DropdownMenu className="max-h-[50vh] overflow-y-auto" onAction={(key) => setSelectedBgAudio(key.toString())}>
                                {bgAudio.map(sound => <DropdownItem key={sound} startContent={<FaVolumeUp />}>{sound}</DropdownItem>)}
                            </DropdownMenu>
                        </Dropdown>
                        <Tooltip content="Fetch background sounds">
                            <Button isIconOnly onClick={() => fetchBgAudio()}><FaSync /></Button>
                        </Tooltip>
                        <Tooltip content="Random background sound">
                            <Button isIconOnly onClick={() => setSelectedBgAudio(bgAudio[Math.floor(Math.random() * bgAudio.length)])}><FaRandom /></Button>
                        </Tooltip>
                    </ButtonGroup>
                </div>
                <div className="flex justify-between my-4">
                    <div>
                        <p className={title({ size: 'sm' })}>Orientation</p>
                        <p className={subtitle({ size: 'sm' })}>Select the video orientation</p>
                        {(selectedOrientation != 'Vertical') ? <Chip className="mt-2" color='danger' variant='shadow'>Horizontal orientation may produce issues due to WIP</Chip> : null}
                    </div>
                    <Dropdown>

                        <DropdownTrigger>
                            <Button endContent={<FaAngleDown />}>{selectedOrientation}</Button>
                        </DropdownTrigger>

                        <DropdownMenu onAction={(key) => setSelectedOrientation(key.toString())} >
                            {config.videoOptions.orientations.map(orientation => <DropdownItem key={orientation}>{orientation}</DropdownItem>)}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <FaSlidersH />
                <h1 className={title()}>Misc Options</h1>
            </div>
            <Divider />
            <div className="space-y-4 mb-8">
                {config.miscOptions.map(option => (
                    <div key={option.name} className="flex justify-between my-4">
                        <div>
                            <p className={title({ size: 'sm' })}>{option.fullName}</p>
                            <p className={subtitle({ size: 'sm' })}>{option.description}</p>
                        </div>
                        <Checkbox key={option.name} isSelected={miscOptions[config.miscOptions.indexOf(option)]} onValueChange={(e) => {
                            const newOptions = [...miscOptions];
                            newOptions[config.miscOptions.indexOf(option)] = e;
                            setMiscOptions(newOptions);
                        }}>{miscOptions[config.miscOptions.indexOf(option)]
                            ? 'Enabled' : 'Disabled'}</Checkbox>
                    </div>
                ))}
            </div>
            <Divider />
            <div className="flex justify-center mt-4">
                <Button color='primary' variant='shadow' size='lg' startContent={<FaSave />} onPress={() => {
                    setAdvancedOptions({
                        aiType: selectedAIType.type,
                        aiModel: selectedAIModel,
                        voiceGenType: selectedTTSProvider.type,
                        imageGenType: selectedImageType.type,
                        orientation: selectedOrientation,
                        vidPath: selectedBgVideo,
                        bgPath: selectedBgAudio,
                        internalOptions: {
                            // TODO: Remove use of findIndex() to find index of option
                            changePhotos: miscOptions[config.miscOptions.findIndex(option => option.name === 'changePhotos')],
                            disableTTS: miscOptions[config.miscOptions.findIndex(option => option.name === 'disableTTS')],
                            disableSubtitles: miscOptions[config.miscOptions.findIndex(option => option.name === 'disableSubtitles')],
                            useMock: miscOptions[config.miscOptions.findIndex(option => option.name === 'useMock')],
                        }
                    })
                }}>
                    Save Settings
                </Button>
            </div>
        </div>

    );
}
