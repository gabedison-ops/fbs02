
import React, { useState, useRef, useEffect } from 'react';
import MetricCircle from './MetricCircle';
import { CallMetric, TranscriptEntry, EvaluationResult } from '../types';
import { MicrophoneIcon, MuteIcon, EndCallIcon, HomeIcon, PlayIcon, LoadingIcon, ClipboardCheckIcon } from './icons';
// FIX: LiveSession is no longer exported from @google/genai.
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import EvaluationModal from './EvaluationModal';

// --- Audio Utility Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
// --- End Audio Utility Functions ---

interface Scenario {
  id: string;
  description: string;
  prompt: string;
  avatar: string;
}

interface CallSimulatorProps {
  title: string;
  scenarios: Scenario[];
  activeScenario: Scenario;
  setActiveScenario: (scenario: Scenario) => void;
  systemInstruction: string;
  goHome: () => void;
  metrics: CallMetric[];
  functionDeclarations?: FunctionDeclaration[];
  onToolCall?: (name: string, args: any) => Promise<any>;
}

const CallSimulator: React.FC<CallSimulatorProps> = ({ title, activeScenario, systemInstruction, goHome, metrics, functionDeclarations, onToolCall }) => {
    const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [currentMetrics, setCurrentMetrics] = useState<CallMetric[]>(metrics);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
    
    // FIX: LiveSession type is not available, using Promise<any> for the session object.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const resetMetrics = () => {
        setCurrentMetrics(metrics.map(m => ({ ...m, value: 0 })));
    };

    const cleanup = () => {
        console.log('Cleaning up resources...');
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();

        if (mediaStreamSourceRef.current && scriptProcessorRef.current) {
            mediaStreamSourceRef.current.disconnect(scriptProcessorRef.current);
        }
        if (scriptProcessorRef.current && inputAudioContextRef.current) {
            scriptProcessorRef.current.disconnect(inputAudioContextRef.current.destination);
        }
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        inputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        outputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current = null;

        sessionPromiseRef.current = null;
    };
    
    const endCall = async () => {
        console.log('Ending call...');
        setCallStatus('ended');
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (error) {
                console.error("Error closing session:", error);
            }
        }
        cleanup();
    };

    const handleEvaluate = async () => {
        if (transcript.length < 2) {
            alert("Not enough conversation to evaluate.");
            return;
        }
        setIsEvaluating(true);
        setEvaluationResult(null);

        const fullTranscript = transcript.map(t => `${t.speaker === 'user' ? 'Student' : 'Customer'}: ${t.text}`).join('\n');
        
        const metricNames = metrics.map(m => m.label.toLowerCase());
        const metricSchema: { [key: string]: { type: Type, description: string } } = {};
        metricNames.forEach(name => {
            metricSchema[name] = { type: Type.NUMBER, description: `Score for ${name} from 0 to 100.` };
        });

        const evaluationSystemPrompt = `You are an expert hospitality trainer analyzing a conversation between a customer and a hospitality student. The context is a ${title.toLowerCase()}.
        Based on the transcript, evaluate the student's performance on these metrics: ${metricNames.join(', ')}.
        Provide a score from 0 to 100 for each metric.
        Also, provide a list of what the student did well (good_points) and a list of areas for improvement (areas_for_improvement).
        Your response must be in JSON format.`;

        try {
            const apiKey = import.meta.env.VITE_API_KEY;
            if (!apiKey) {
                alert("Configuration Error: The Google Gemini API key is missing. In your hosting provider (like Netlify or Vercel), please set an environment variable named VITE_API_KEY.");
                setIsEvaluating(false);
                return;
            }
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `${evaluationSystemPrompt}\n\nTRANSCRIPT:\n${fullTranscript}`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            scores: {
                                type: Type.OBJECT,
                                properties: metricSchema
                            },
                            good_points: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            areas_for_improvement: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            const result: EvaluationResult = JSON.parse(response.text);
            setEvaluationResult(result);
            setIsEvaluationModalOpen(true);
            
            const newMetrics = metrics.map(m => ({ ...m, value: result.scores[m.label.toLowerCase()] || 0 }));
            setCurrentMetrics(newMetrics);

        } catch (error) {
            console.error("Evaluation failed:", error);
            alert("Sorry, an error occurred during evaluation.");
        } finally {
            setIsEvaluating(false);
        }
    };


    const startCall = async () => {
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
            alert("Configuration Error: API Key is missing.\n\nPlease go to your hosting provider (Netlify, Vercel, etc.) and add an Environment Variable.\n\nName: VITE_API_KEY\nValue: your-google-gemini-api-key");
            setCallStatus('idle');
            return;
        }

        setTranscript([]);
        resetMetrics();
        setEvaluationResult(null);
        setCallStatus('connecting');

        try {
            const ai = new GoogleGenAI({ apiKey });
            
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: `${systemInstruction} Start the conversation by saying: "${activeScenario.prompt}"`,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: functionDeclarations ? [{ functionDeclarations }] : undefined,
                },
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        setCallStatus('active');
                        mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            if (isMuted) return;
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            // FIX: The `isFinal` property is no longer available on `inputTranscription`.
                            // We now rely on `turnComplete` to finalize the transcript.
                            const text = message.serverContent.inputTranscription.text;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'user' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { speaker: 'user', text, isFinal: false }];
                                }
                                return [...prev, { speaker: 'user', text, isFinal: false }];
                            });
                        }
                        if (message.serverContent?.outputTranscription) {
                             // FIX: The `isFinal` property is no longer available on `outputTranscription`.
                             // We now rely on `turnComplete` to finalize the transcript.
                             const text = message.serverContent.outputTranscription.text;
                             setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'model' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { speaker: 'model', text, isFinal: false }];
                                }
                                return [...prev, { speaker: 'model', text, isFinal: false }];
                            });
                        }

                        if (message.serverContent?.turnComplete) {
                            setTranscript(prev => prev.map(entry => entry.isFinal ? entry : {...entry, isFinal: true}));
                        }
                        
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            const ctx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                        
                        if (message.toolCall?.functionCalls && onToolCall) {
                            const session = await sessionPromise;
                            for (const fc of message.toolCall.functionCalls) {
                                const result = await onToolCall(fc.name, fc.args);
                                session.sendToolResponse({
                                    functionResponses: { id: fc.id, name: fc.name, response: { result } }
                                });
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setCallStatus('ended');
                        cleanup();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Session closed.');
                        if(callStatus !== 'ended') {
                             setCallStatus('ended');
                             cleanup();
                        }
                    },
                }
            });
            sessionPromiseRef.current = sessionPromise;

        } catch (error) {
            console.error("Failed to start call:", error);
            setCallStatus('idle');
            cleanup();
        }
    };

    useEffect(() => {
        return () => {
            if (sessionPromiseRef.current) {
                endCall();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderCallControls = () => {
        if (callStatus === 'idle' || callStatus === 'ended') {
            return (
                <button onClick={startCall} className="bg-green-600 rounded-full p-4 hover:bg-green-700 animate-pulse">
                    <PlayIcon className="w-8 h-8 text-white"/>
                </button>
            )
        }
        if (callStatus === 'connecting') {
            return (
                <button disabled className="bg-gray-500 rounded-full p-4 cursor-not-allowed">
                    <LoadingIcon className="w-8 h-8 text-white animate-spin"/>
                </button>
            )
        }
        if (callStatus === 'active') {
            return (
                <>
                    <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center text-gray-300 hover:text-white">
                        {isMuted ? <MuteIcon className="w-8 h-8"/> : <MicrophoneIcon className="w-8 h-8"/> }
                        <span className="text-xs mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                    <button onClick={endCall} className="bg-red-600 rounded-full p-4 hover:bg-red-700">
                        <EndCallIcon className="w-8 h-8 text-white"/>
                    </button>
                </>
            )
        }
        return null;
    }

    return (
        <div className="w-1/3 bg-[#2C3E50] rounded-lg shadow-2xl p-6 flex flex-col text-white h-full">
            {isEvaluationModalOpen && evaluationResult && (
                <EvaluationModal result={evaluationResult} onClose={() => setIsEvaluationModalOpen(false)} />
            )}
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold tracking-wider">{title}</h2>
                 <button onClick={goHome} className="p-2 rounded-full hover:bg-gray-700 transition">
                    <HomeIcon className="w-6 h-6" />
                 </button>
            </div>
           
            <div className="flex-grow bg-[#34495E] rounded-lg p-6 mb-6 overflow-y-auto min-h-0">
                <div className="flex items-center mb-6">
                    <img src={activeScenario.avatar} alt="Caller" className="w-16 h-16 rounded-full mr-4 border-2 border-blue-400"/>
                    <div>
                        <div className={`text-white px-4 py-1 rounded-full text-sm font-semibold ${callStatus === 'active' ? 'bg-red-500' : 'bg-blue-500'}`}>
                           {callStatus === 'active' ? 'LIVE' : callStatus === 'connecting' ? 'CONNECTING...' : callStatus === 'ended' ? 'CALL ENDED' : 'INCOMING CALL'}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {transcript.length === 0 && callStatus !== 'active' && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">C</div>
                            <div className="bg-[#2C3E50] p-3 rounded-lg max-w-xs">
                                <p className="italic text-gray-400">Press start to begin the call...</p>
                            </div>
                        </div>
                    )}
                    {transcript.map((entry, index) => (
                        entry.speaker === 'model' ? (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">C</div>
                                <div className="bg-[#2C3E50] p-3 rounded-lg max-w-xs">
                                    <p>{entry.text}</p>
                                </div>
                            </div>
                        ) : (
                            <div key={index} className="flex items-start gap-3 justify-end">
                                <div className="bg-blue-500 p-3 rounded-lg max-w-xs">
                                    <p>{entry.text}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"><MicrophoneIcon className="w-5 h-5"/></div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            <div className="flex justify-center items-center gap-6 mb-6 h-16">
               {renderCallControls()}
            </div>

            <div className="border-t border-gray-600 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-center">CALL METRICS</h3>
                    {callStatus === 'ended' && (
                         <button onClick={handleEvaluate} disabled={isEvaluating} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-500">
                             {isEvaluating ? <LoadingIcon className="w-5 h-5 animate-spin" /> : <ClipboardCheckIcon className="w-5 h-5"/>}
                             <span>{isEvaluating ? 'Evaluating...' : 'Evaluate Call'}</span>
                         </button>
                    )}
                </div>
                <div className="flex justify-around">
                    {currentMetrics.map(metric => (
                       <MetricCircle key={metric.label} label={metric.label} percentage={metric.value} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CallSimulator;