import React, { useEffect, useState } from 'react';

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import { Accordion, AccordionItem } from '@nextui-org/accordion';
import { Input, Textarea } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Code } from '@nextui-org/code';
import { Progress } from '@nextui-org/progress';
import { Chip } from '@nextui-org/chip';

import AdvancedOptions from '@/components/options';
import { subtitle, title } from '@/components/primitives';
import { ConfirmModal } from '@/components/modal';
import { BACKEND_ENDPOINT } from '@/config/backend';
import { defaultVideoOptions, VideoOptions } from '@/config/options';
import { MessageVideoData, QuizVideoData, RankVideoData, RatherVideoData, TopicVideoData, VideoData } from '@/config/video';

import { FaAngleDown, FaArrowLeft, FaArrowRight, FaArrowsAltH, FaCogs, FaComment, FaCommentAlt, FaImage, FaList, FaMagic, FaNewspaper, FaPhone, FaPlus, FaQuestion, FaQuestionCircle, FaSave, FaSearch, FaTextHeight, FaTrash, FaVolumeUp } from 'react-icons/fa';

const videoTypes = [
    {
        type: "message",
        name: "Message",
        icon: <FaComment />,
        description: "Send a message to a person"
    },
    {
        type: "topic",
        name: "Topic",
        icon: <FaNewspaper />,
        description: "Create a topic video"
    },
    {
        type: "quiz",
        name: "Quiz",
        icon: <FaQuestion />,
        description: "Create a quiz video"
    },
    {
        type: "rank",
        name: "Rank",
        icon: <FaList />,
        description: "Create a rank video"
    },
    {
        type: "rather",
        name: "Rather",
        icon: <FaQuestionCircle />,
        description: "Create a rather video"
    }
];

export function VideoGenerator({ json = null, isAI = false, options = null }: { json?: string | null, isAI?: boolean, options?: VideoOptions | null }) {
    const confirmModal = useDisclosure();
    const emptyDataModal = useDisclosure();

    const [selectedType, setSelectedType] = useState(videoTypes[0]);
    const [formData, setFormData] = useState<VideoData | null>(null);

    const [advancedOptions, setAdvancedOptions] = useState<VideoOptions>(defaultVideoOptions);
    const [usedDefaultOptions, setUsedDefaultOptions] = useState(false);

    const [genError, setGenError] = useState<string | null>(null);
    const [renderResult, setRenderResult] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const [videoId, setVideoId] = useState<string | null>(null);

    function handleGenerateVideo() {
        // Check if advanced options are selected, if not, set it to default values
        if ((options ?? advancedOptions) === defaultVideoOptions) setUsedDefaultOptions(true);

        // Check if data is entered
        if (!formData) {
            emptyDataModal.onOpen();
            return;
        }

        if (isAI) {
            renderVideo();
        } else {
            confirmModal.onOpen();
        }
    }

    function renderVideo() {
        setIsGenerating(true);
        callAPIRender();
    }

    // TODO: Use server-side rendering and fetch AI response from the server

    async function callAPIRender() {
        setGenError(null);

        try {
            // JSON must be compliant with the API (server type of APIVideoData)
            let json = {
                data: formData,
                options: options ?? advancedOptions
            }

            const postData = JSON.stringify(json);

            // POST request to fetch AI JSON
            let res = await fetch(`${BACKEND_ENDPOINT}/generateVideo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: postData
            });

            if (!res.ok) {
                setGenError('Failed to generate video: ' + (res.statusText ?? res.toString()));
                return;
            }

            if (res.body == null) {
                setGenError('Failed to generate video: Response body is empty!');
                return;
            }

            // Read the stream
            const reader = res.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const stringDecodedData = new TextDecoder("utf-8").decode(value);

                const dataObjects = stringDecodedData.split("data: ").slice(1);

                for (const dataString of dataObjects) {
                    if (dataString.trim() === "[DONE]") break;

                    const data = JSON.parse(dataString);

                    // Check if error
                    if (data.error) {
                        setGenError('Failed to generate video: ' + data.error);
                        return;
                    }

                    // Update render result (log is the output from the server)
                    if (data.log) {
                        setRenderResult(renderResult ? renderResult + '\n' + data.log : data.log);
                    }

                    // Check if JSON has 'videoPath' field
                    if (data.videoId) {
                        setIsGenerated(true);
                        setGenError(null);
                        setVideoId(data.videoId);
                        return;
                    }
                }
            }
        } catch (e: any) {
            setGenError('Failed to generate video due to internal error: ' + (e.message ?? e.toString()));
        }
    }

    const renderForm = () => {
        let type = selectedType.type;
        if (json) {
            type = JSON.parse(json).type;
        }

        switch (type) {
            case "message":
                return <MessageVideoForm setFormData={setFormData} json={json} isAI={isAI} />;
            case "quiz":
                return <QuizVideoForm setFormData={setFormData} json={json} isAI={isAI} />;
            case "rank":
                return <RankVideoForm setFormData={setFormData} json={json} isAI={isAI} />;
            case "rather":
                return <RatherVideoForm setFormData={setFormData} json={json} isAI={isAI} />;
            case "topic":
                return <TopicVideoForm setFormData={setFormData} json={json} isAI={isAI} />;
            default:
                return null;
        }
    };

    return (
        isGenerating ? <RenderingOutput renderResult={renderResult} genError={genError} isGenerated={isGenerated} videoId={videoId} /> :
            <div className="space-y-4">
                {isAI
                    ? <div className="flex flex-col items-center justify-center gap-4 w-full">
                        <p className={title()}>Review AI generated video script</p>
                        <p className={subtitle({ size: 'sm' })}>AI has generated the video script. You can edit it below if needed. Click on "Render Video" to generate the video.</p>
                    </div>
                    : <div className="flex flex-row items-center gap-4 justify-center">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button startContent={selectedType.icon} endContent={<FaAngleDown />}>{selectedType.name}</Button>
                            </DropdownTrigger>
                            <DropdownMenu onAction={(key) => setSelectedType(videoTypes.find(type => type.type === key.toString())!)} >
                                {videoTypes.map(type => <DropdownItem key={type.type} description={type.description} startContent={type.icon}>{type.name}</DropdownItem>)}
                            </DropdownMenu>
                        </Dropdown>
                        <p className={subtitle({ size: 'sm' })}>{selectedType.description}</p>
                    </div>
                }
                <Divider className="my-4" />
                {renderForm()}
                {options ? null :
                    <>
                        <Divider />
                        <Accordion>
                            <AccordionItem startContent={<FaCogs />} title="Advanced Options" subtitle='Change options such as AI model, TTS voice, background music, etc.'>
                                <AdvancedOptions setAdvancedOptions={setAdvancedOptions} />
                            </AccordionItem>
                        </Accordion>
                    </>
                }
                <Divider />
                <div className="flex flex-row items-center gap-4 justify-center">
                    <Button className="mt-4" onClick={handleGenerateVideo} startContent={<FaMagic />} variant='shadow' color='primary' size='lg'>Render Video</Button>
                </div>
                <ConfirmModal confirmModal={confirmModal} advancedOptions={advancedOptions} renderVideo={renderVideo} usedDefaultOptions={usedDefaultOptions} />
                <Modal isOpen={emptyDataModal.isOpen} onOpenChange={emptyDataModal.onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Error: No data entered!</ModalHeader>
                                <ModalBody>
                                    <p>You need to enter data for the video to be generated.</p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onPress={onClose}>
                                        OK
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
    );
}

export const RenderingOutput = ({ renderResult, genError, isGenerated, videoId }: { renderResult: string | null, genError: string | null, isGenerated: boolean, videoId: string | null }) => {
    return (
        isGenerated
            ?
            <>
                <div className="flex flex-col items-center justify-center gap-4 w-full">
                    <p className={title()}>Video Rendered Successfully!</p>
                    <p className={subtitle({ size: 'sm' })}>The video has been rendered successfully. You can download it from the link below.</p>
                    <Code>{"video.mp4"}</Code>
                    <video src={`${BACKEND_ENDPOINT}/getVideo?id=${videoId}`} controls width={300} />
                    <Button color='primary' variant='shadow' startContent={<FaSave />} onClick={() => window.location.href = `${BACKEND_ENDPOINT}/getVideo?id=${videoId}`}>Download Video</Button>
                    <Button size="sm" startContent={<FaArrowLeft />} onClick={() => window.location.reload()}>Go Back</Button>
                </div>
            </>
            :
            <>
                {genError ?
                    <div className="flex flex-col items-center justify-center gap-4 w-full">
                        <p className={title()}>Error Rendering Video</p>
                        <p className={subtitle({ size: 'sm' })}>An error occurred while rendering the video. Please check the error message below.</p>
                        <Chip color='danger' variant='shadow'>{genError}</Chip>
                        <Button size="sm" startContent={<FaArrowLeft />} onClick={() => window.location.reload()}>Go Back</Button>
                    </div>
                    : <div className="flex flex-col items-center justify-center gap-4 w-full">
                        <p className={title()}>Rendering Video...</p>
                        <p className={subtitle({ size: 'sm' })}>Please wait while the video is being rendered. This may 5-10 minutes depending on the video length and more.</p>
                        <Progress
                            size="md"
                            isIndeterminate
                            aria-label="Loading..."
                            className="max-w-md"
                        />
                        <Code>{renderResult ?? "Loading"}</Code>
                        <Button size="sm" startContent={<FaArrowLeft />} onClick={() => window.location.reload()}>Go Back</Button>
                    </div>
                }
            </>
    );
}

type MessageVideoFormProps = {
    setFormData: React.Dispatch<React.SetStateAction<VideoData | null>>;
    json: string | null;
    isAI: boolean;
};

const MessageVideoForm: React.FC<MessageVideoFormProps> = ({ setFormData, json, isAI }) => {
    const [contactName, setContactName] = useState('');
    const [script, setScript] = useState([{ voice: 'male' as const, message: '', msgtype: 'sender' as const }]);
    const [extra, setExtra] = useState('');

    const handleAddMessage = () => {
        setScript([...script, { voice: 'male', message: '', msgtype: 'sender' }]);
    };

    const handleChange = (index: number, field: string, value: string) => {
        const newScript = [...script];
        (newScript[index] as any)[field] = value;
        setScript(newScript);
    };

    const handleSubmit = () => {
        const data: MessageVideoData = {
            type: 'message',
            contactname: contactName,
            script,
            extra,
        };
        setFormData(data);
    };

    // Handle JSON if not null on initial load
    useEffect(() => {
        if (json) {
            const { contactname, script, extra } = JSON.parse(json);
            if (contactname) setContactName(contactname);
            if (script) setScript(script);
            if (extra) setExtra(extra);
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaPhone />
                    <h1 className={title()}>Contact name of person</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the name of the person you want to send the message to.</p>
            </div>
            <div className="mt-4">
                <Input label="Contact Name" value={contactName} onChange={(e) => setContactName(e.target.value)} onClear={() => setContactName('')} isClearable />
            </div>
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaComment />
                    <h1 className={title()}>{`Message list for ${contactName}`}</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the messages you want to send to the person.</p>
            </div>
            {script.map((msg, index) => (
                <div key={index} className="flex flex-col items-center space-x-2">
                    <Textarea label="Message" value={msg.message} onChange={(e) => handleChange(index, 'message', e.target.value)} />
                    <div className="flex flex-row gap-2 mt-4">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button startContent={<FaVolumeUp />} endContent={<FaAngleDown />}>{msg.voice.charAt(0).toUpperCase() + msg.voice.slice(1)}</Button>
                            </DropdownTrigger>
                            <DropdownMenu onAction={(key) => handleChange(index, 'voice', key.toString())}>
                                <DropdownItem key="male" startContent={<FaVolumeUp />} description="Speak message in male-like voice">Male</DropdownItem>
                                <DropdownItem key="female" startContent={<FaVolumeUp />} description="Speak message in female-like voice">Female</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button startContent={msg.msgtype == "sender" ? <FaArrowLeft /> : <FaArrowRight />} endContent={<FaAngleDown />}>{msg.msgtype.charAt(0).toUpperCase() + msg.msgtype.slice(1)}</Button>
                            </DropdownTrigger>
                            <DropdownMenu onAction={(key) => handleChange(index, 'msgtype', key.toString())}>
                                <DropdownItem key="sender" startContent={<FaArrowLeft />} description="Message will come from the sender (right side)">Sender</DropdownItem>
                                <DropdownItem key="receiver" startContent={<FaArrowRight />} description="Message will come from the receiver (left side; the contact name)">Receiver</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Button color='danger' startContent={<FaTrash />} isIconOnly onClick={() => setScript(script.filter((_, i) => i !== index))} />
                    </div>
                </div>
            ))}
            <Button onClick={handleAddMessage} startContent={<FaPlus />}>Add Message</Button>
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaCommentAlt />
                    <h1 className={title()}>Extra script information</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter any extra information you want to include in the script.</p>
            </div>
            <Textarea placeholder="Extra" value={extra} onChange={(e) => setExtra(e.target.value)} />
            <Divider />
            <div className="flex justify-center mt-4">
                <Button color='primary' variant='shadow' size='lg' startContent={<FaSave />} onClick={handleSubmit}>Save Data</Button>
            </div>
        </div>
    );
};

type QuizVideoFormProps = {
    setFormData: React.Dispatch<React.SetStateAction<VideoData | null>>;
    json: string | null;
    isAI: boolean;
};

const QuizVideoForm: React.FC<QuizVideoFormProps> = ({ setFormData, json, isAI }) => {
    const [quizTitle, setTitle] = useState('');
    const [questions, setQuestions] = useState(['']);
    const [answers, setAnswers] = useState(['']);
    const [startScript, setStartScript] = useState('');
    const [endScript, setEndScript] = useState('');

    const handleAddQuestion = () => {
        setQuestions([...questions, '']);
        handleAddAnswer();
    };

    const handleAddAnswer = () => {
        setAnswers([...answers, '']);
    };

    const handleChange = (index: number, field: string[], value: string) => {
        const newArray = [...field];
        newArray[index] = value;
        field === questions ? setQuestions(newArray) : setAnswers(newArray);
    };

    const handleSubmit = () => {
        const data: QuizVideoData = {
            type: 'quiz',
            title: quizTitle,
            questions,
            answers,
            start_script: startScript,
            end_script: endScript,
        };
        setFormData(data);
    };

    // Handle JSON if not null on initial load
    useEffect(() => {
        if (json) {
            const { title, questions, answers, start_script, end_script } = JSON.parse(json);
            if (title) setTitle(title);
            if (questions) setQuestions(questions);
            if (answers) setAnswers(answers);
            if (start_script) setStartScript(start_script);
            if (end_script) setEndScript(end_script);
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaTextHeight />
                    <h1 className={title()}>Quiz title</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the title of the quiz.</p>
            </div>
            <Input label="Title" value={quizTitle} onChange={(e) => setTitle(e.target.value)} onClear={() => setTitle('')} isClearable />
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaQuestion />
                    <h1 className={title()}>Question and Answer</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the questions and answers for the quiz. {`(${questions.length} questions)`}</p>
            </div>
            {questions.map((question, index) => (
                <div key={index} className="flex flex-row items-center gap-4">
                    <Input label={`Question #${index + 1}`} value={question} onChange={(e) => handleChange(index, questions, e.target.value)} />
                    <Input label="Answer" value={answers[index]} onChange={(e) => handleChange(index, answers, e.target.value)} />
                    <Button color='danger' startContent={<FaTrash />} isIconOnly onClick={() => {
                        setQuestions(questions.filter((_, i) => i !== index));
                        setAnswers(answers.filter((_, i) => i !== index));
                    }} />
                </div>
            ))}
            <Button onClick={handleAddQuestion} startContent={<FaPlus />}>Add Question</Button>
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaCommentAlt />
                    <h1 className={title()}>Start and End Script</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the start and end script for the quiz.</p>
            </div>
            <Textarea placeholder="Start Script" value={startScript} onChange={(e) => setStartScript(e.target.value)} />
            <Textarea placeholder="End Script" value={endScript} onChange={(e) => setEndScript(e.target.value)} />
            <Divider />
            <div className="flex justify-center mt-4">
                <Button color='primary' variant='shadow' size='lg' startContent={<FaSave />} onClick={handleSubmit}>Save Data</Button>
            </div>
        </div>
    );
};

type RankVideoFormProps = {
    setFormData: React.Dispatch<React.SetStateAction<VideoData | null>>;
    json: string | null;
    isAI: boolean;
};

const RankVideoForm: React.FC<RankVideoFormProps> = ({ setFormData, json, isAI }) => {
    const [rankTitle, setTitle] = useState('');
    const [rankings, setRankings] = useState(['']);
    const [images, setImages] = useState(['']);
    const [startScript, setStartScript] = useState('');
    const [endScript, setEndScript] = useState('');

    const handleAddRanking = () => {
        setRankings([...rankings, '']);
        handleAddImage();
    };

    const handleAddImage = () => {
        setImages([...images, '']);
    };

    const handleChange = (index: number, field: string[], value: string) => {
        const newArray = [...field];
        newArray[index] = value;
        field === rankings ? setRankings(newArray) : setImages(newArray);
    };

    const handleSubmit = () => {
        const data: RankVideoData = {
            type: 'rank',
            title: rankTitle,
            rankings,
            images,
            start_script: startScript,
            end_script: endScript,
        };
        setFormData(data);
    };

    // Handle JSON if not null on initial load
    useEffect(() => {
        if (json) {
            const { title, rankings, images, start_script, end_script } = JSON.parse(json);
            if (title) setTitle(title);
            if (rankings) setRankings(rankings);
            if (images) setImages(images);
            if (start_script) setStartScript(start_script);
            if (end_script) setEndScript(end_script);
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaTextHeight />
                    <h1 className={title()}>Rank title</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the title of the rank.</p>
            </div>
            <Input label="Title" value={rankTitle} onChange={(e) => setTitle(e.target.value)} onClear={() => setTitle('')} isClearable />
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaImage />
                    <h1 className={title()}>Ranking and Image</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the rankings and images for the rank video. {`(${rankings.length} rankings)`} </p>
            </div>
            {rankings.map((ranking, index) => (
                <div key={index} className="flex flex-row items-center gap-4">
                    <Input label={`Ranking #${index + 1}`} value={ranking} onChange={(e) => handleChange(index, rankings, e.target.value)} />
                    <Input startContent={<FaSearch />} label={`Image #${index + 1}`} value={images[index]} onChange={(e) => handleChange(index, images, e.target.value)} />
                    <Button color='danger' startContent={<FaTrash />} isIconOnly onClick={() => {
                        setRankings(rankings.filter((_, i) => i !== index));
                        setImages(images.filter((_, i) => i !== index));
                    }} />
                </div>
            ))}
            <Button onClick={handleAddRanking} startContent={<FaPlus />}>Add Ranking</Button>

            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaCommentAlt />
                    <h1 className={title()}>Start and End Script</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the start and end script for the rank video.</p>
            </div>
            <Textarea placeholder="Start Script" value={startScript} onChange={(e) => setStartScript(e.target.value)} />
            <Textarea placeholder="End Script" value={endScript} onChange={(e) => setEndScript(e.target.value)} />
            <Divider />
            <div className="flex justify-center mt-4">
                <Button color='primary' variant='shadow' size='lg' startContent={<FaSave />} onClick={handleSubmit}>Save Data</Button>
            </div>
        </div>
    );
};

type RatherVideoFormProps = {
    setFormData: React.Dispatch<React.SetStateAction<VideoData | null>>;
    json: string | null;
    isAI: boolean;
};

const RatherVideoForm: React.FC<RatherVideoFormProps> = ({ setFormData, json, isAI }) => {
    const [rankTitle, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ option1: '', option2: '', p1: 50, p2: 50, image1: '', image2: '' }]);
    const [startScript, setStartScript] = useState('');
    const [endScript, setEndScript] = useState('');

    const handleAddQuestion = () => {
        setQuestions([...questions, { option1: '', option2: '', p1: 50, p2: 50, image1: '', image2: '' }]);
    };

    const handleChange = (index: number, field: string, value: string) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = () => {
        const data: RatherVideoData = {
            type: 'rather',
            title: rankTitle,
            questions,
            start_script: startScript,
            end_script: endScript,
        };
        setFormData(data);
    };

    // Handle JSON if not null on initial load
    useEffect(() => {
        if (json) {
            const { title, questions, start_script, end_script } = JSON.parse(json);
            if (title) setTitle(title);
            if (questions) setQuestions(questions);
            if (start_script) setStartScript(start_script);
            if (end_script) setEndScript(end_script);
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaTextHeight />
                    <h1 className={title()}>Title of rather video</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the title of the rather video.</p>
            </div>
            <Input label="Title" value={rankTitle} onChange={(e) => setTitle(e.target.value)} onClear={() => setTitle('')} isClearable />
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaQuestion />
                    <h1 className={title()}>Questions and Answers</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the questions and answers for the rather video. {`(${questions.length} questions)`}</p>
            </div>
            {questions.map((question, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input min={1} label="Option 1" value={question.option1} placeholder='Would you rather [option 1]' onChange={(e) => handleChange(index, 'option1', e.target.value)} />
                    <Input label="Option 2" value={question.option2} placeholder='or [option 2]' onChange={(e) => handleChange(index, 'option2', e.target.value)} />
                    <Input label="Percent 1 (%)" value={question.p1.toString()} onChange={(e) => handleChange(index, 'p1', e.target.value)} />
                    <Input label="Percent 2 (%)" value={question.p2.toString()} onChange={(e) => handleChange(index, 'p2', e.target.value)} />
                    <Input label="Image 1" value={question.image1} startContent={<FaSearch />} placeholder='Search term...' onChange={(e) => handleChange(index, 'image1', e.target.value)} />
                    <Input label="Image 2" value={question.image2} startContent={<FaSearch />} placeholder='Search term...' onChange={(e) => handleChange(index, 'image2', e.target.value)} />
                    <Button color='danger' startContent={<FaTrash />} isIconOnly onClick={() => setQuestions(questions.filter((_, i) => i !== index))} />
                </div>
            ))}
            <Button onClick={handleAddQuestion} startContent={<FaPlus />}>Add Question</Button>
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaCommentAlt />
                    <h1 className={title()}>Start and End Script</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the start and end script for the rather video.</p>
            </div>
            <Textarea placeholder="Start Script" value={startScript} onChange={(e) => setStartScript(e.target.value)} />
            <Textarea placeholder="End Script" value={endScript} onChange={(e) => setEndScript(e.target.value)} />
            <Divider />
            <div className="flex justify-center mt-4">
                <Button color='primary' variant='shadow' size='lg' startContent={<FaSave />} onClick={handleSubmit}>Save Data</Button>
            </div>
        </div>
    );
};

type TopicVideoFormProps = {
    setFormData: React.Dispatch<React.SetStateAction<VideoData | null>>;
    json: string | null;
    isAI: boolean;
};

const TopicVideoForm: React.FC<TopicVideoFormProps> = ({ setFormData, json, isAI }) => {
    const [topicTitle, setTitle] = useState('');
    const [text, setText] = useState('');
    const [startScript, setStartScript] = useState('');
    const [endScript, setEndScript] = useState('');
    const [images, setImages] = useState(['']);

    const handleAddImage = () => {
        setImages([...images, '']);
    };

    const handleChange = (index: number, value: string) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    };

    const handleSubmit = () => {
        const data: TopicVideoData = {
            type: 'topic',
            text,
            start_script: startScript,
            end_script: endScript,
            images
        };
        setFormData(data);
    };

    // Handle JSON if not null on initial load
    useEffect(() => {
        if (json) {
            console.log(json);
            console.table(JSON.parse(json));
            const { text, images, start_script, end_script } = JSON.parse(json);
            if (text) setText(text);
            if (images) setImages(images);
            if (start_script) setStartScript(start_script);
            if (end_script) setEndScript(end_script);
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaTextHeight />
                    <h1 className={title()}>Title of topic video</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the title of the topic video.</p>
            </div>
            <Input label="Title" value={topicTitle} onChange={(e) => setTitle(e.target.value)} onClear={() => setTitle('')} isClearable />
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaNewspaper />
                    <h1 className={title()}>Text script for video</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the full text script for the topic video.</p>
            </div>
            <Textarea placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} />
            <Divider />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <FaImage />
                    <h1 className={title()}>Images for video</h1>
                </div>
                <p className={subtitle({ size: 'sm' })}>Enter the image search term that will be used in the video. {`(${images.length} images)`}</p>
            </div>
            {images.map((image, index) => (
                <Input startContent={<FaSearch />} key={index} placeholder="Image search term" value={image} onChange={(e) => handleChange(index, e.target.value)}
                    endContent={<Button color='danger' variant='light' startContent={<FaTrash />} isIconOnly radius='full' onClick={() => setImages(images.filter((_, i) => i !== index))} />}
                />
            ))}
            <Button onClick={handleAddImage} startContent={<FaPlus />}>Add Image</Button>
            <Divider />
            <div className="flex justify-center mt-4">
                <Button color='primary' variant='shadow' size='lg' startContent={<FaSave />} onClick={handleSubmit}>Save Data</Button>
            </div>
        </div>

    );
};
