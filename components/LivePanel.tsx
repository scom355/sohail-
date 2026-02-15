
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, decodeAudioData, encodeAudio } from '../services/geminiService';

const LivePanel: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    
    // Stop all audio
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const outNode = outAudioContextRef.current.createGain();
      outNode.connect(outAudioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            setIsActive(true);
            setIsConnecting(false);
            
            // Microphone streaming logic
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = encodeAudio(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: any) => {
            // Audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
              const audioData = decodeBase64(base64Audio);
              const buffer = await decodeAudioData(audioData, outAudioContextRef.current, 24000, 1);
              
              const src = outAudioContextRef.current.createBufferSource();
              src.buffer = buffer;
              src.connect(outNode);
              src.onended = () => sourcesRef.current.delete(src);
              src.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(src);
            }

            // Transcriptions
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') {
                  return [...prev.slice(0, -1), { role: 'model', text: last.text + text }];
                }
                return [...prev, { role: 'model', text }];
              });
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscriptions(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'user') {
                  return [...prev.slice(0, -1), { role: 'user', text: last.text + text }];
                }
                return [...prev, { role: 'user', text }];
              });
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            stopSession();
          },
          onclose: () => {
            console.log('Live session closed');
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a helpful and witty voice assistant. Keep responses brief and conversational.',
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start Live session:', err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-8 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-blue-900/10 to-transparent">
        <div className="relative">
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
            isActive ? 'border-blue-500 scale-110 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-white/10'
          }`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isActive ? 'bg-blue-500 animate-pulse' : 'bg-white/5'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
          {isActive && (
            <div className="absolute inset-0 -m-4">
              <div className="w-full h-full rounded-full border border-blue-500/30 animate-ping"></div>
            </div>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Live Voice Mode</h2>
          <p className="text-sm text-gray-400 max-w-sm">Low-latency conversational AI. Just start talking to Gemini.</p>
        </div>

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`px-12 py-3 rounded-full font-bold transition-all ${
            isActive 
              ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-900/20'
          }`}
        >
          {isConnecting ? 'Initializing...' : (isActive ? 'Stop Session' : 'Start Conversation')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/40">
        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Live Transcript</h3>
        {transcriptions.length === 0 && (
          <p className="text-xs text-gray-600 italic">No activity yet. Speak to see the transcript...</p>
        )}
        {transcriptions.map((t, i) => (
          <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl text-sm max-w-[80%] ${
              t.role === 'user' ? 'bg-blue-900/20 text-blue-300' : 'bg-gray-800 text-gray-300'
            }`}>
              {t.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivePanel;
