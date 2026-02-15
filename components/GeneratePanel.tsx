
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { GenerationResult } from '../types';

const GeneratePanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setStatus(type === 'image' ? 'Crafting your image...' : 'Initializing video generation engine...');

    try {
      if (type === 'video') {
        const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio?.openSelectKey();
          // Assuming selection was successful based on guidelines
        }
      }

      let url = '';
      if (type === 'image') {
        url = await geminiService.generateImage(prompt);
      } else {
        url = await geminiService.generateVideo(prompt);
      }

      setResults(prev => [{ type, url, prompt }, ...prev]);
      setPrompt('');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Requested entity was not found')) {
        await (window as any).aistudio?.openSelectKey();
      }
      alert('Generation failed. Please check console.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Multi-Modal Creation</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setType('image')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
              type === 'image' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:bg-[#222]'
            }`}
          >
            Image Generation
          </button>
          <button
            onClick={() => setType('video')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
              type === 'video' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:bg-[#222]'
            }`}
          >
            Video Generation (Veo)
          </button>
        </div>
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={type === 'image' ? "A majestic mountain landscape in cyberpunk style..." : "A neon hologram of a cat driving at top speed through Tokyo..."}
            className="w-full h-24 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {status}
              </>
            ) : (
              `Generate ${type === 'image' ? 'Image' : 'Video'}`
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {results.length === 0 && !loading && (
          <div className="h-48 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2 opacity-20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-sm">No generations yet. Start by entering a prompt!</p>
          </div>
        )}
        
        {results.map((res, i) => (
          <div key={i} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="aspect-video w-full bg-[#1a1a1a]">
              {res.type === 'image' ? (
                <img src={res.url} alt={res.prompt} className="w-full h-full object-contain" />
              ) : (
                <video src={res.url} controls className="w-full h-full object-contain" />
              )}
            </div>
            <div className="p-4 bg-[#111]">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${res.type === 'image' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {res.type}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">ID: {Math.random().toString(36).substr(2, 9)}</span>
              </div>
              <p className="text-sm text-gray-300 italic">"{res.prompt}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratePanel;
