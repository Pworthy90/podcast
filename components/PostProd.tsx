
import React, { useState } from 'react';
import { Scissors, Sparkles, Video } from 'lucide-react';
import { Button, Card } from './Shared';
import { TranscriptAnalysis } from '../types';
import { geminiService } from '../services/geminiService';

export const PostProd = () => {
  const [transcriptInput, setTranscriptInput] = useState('');
  const [transcriptAnalysis, setTranscriptAnalysis] = useState<TranscriptAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const handleAnalyzeTranscript = async () => {
    if (!transcriptInput) return;
    setIsGenerating(true);
    const analysis = await geminiService.analyzeTranscript(transcriptInput);
    setTranscriptAnalysis(analysis);
    setIsGenerating(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
  };

  const handleAnalyzeMedia = async () => {
    if (!mediaFile) return;
    setIsGenerating(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const analysis = await geminiService.analyzeMedia(base64, mediaFile.type);
      setTranscriptAnalysis(analysis);
      setIsGenerating(false);
    };
    reader.readAsDataURL(mediaFile);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Post-Production Suite</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <h3 className="font-bold mb-4 flex items-center gap-2"><Scissors size={18}/> Content Analyzer</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Option A: Text */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Option A: Paste Transcript</label>
                <textarea 
                    className="w-full h-32 bg-black/5 dark:bg-black/30 rounded-lg p-3 text-sm mb-2 focus:outline-none focus:border-accent border border-transparent font-mono"
                    placeholder="[00:00:00] Host: Welcome back..."
                    value={transcriptInput}
                    onChange={(e) => setTranscriptInput(e.target.value)}
                />
                <Button onClick={handleAnalyzeTranscript} disabled={!transcriptInput || isGenerating} className="w-full justify-center" icon={Sparkles} variant="secondary">
                    Analyze Text
                </Button>
            </div>

            {/* Option B: Video/Audio */}
            <div className="border-l border-black/10 dark:border-white/10 pl-6">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Option B: Upload Media (AI Vision)</label>
                <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-black/5 dark:hover:bg-white/5 transition-all mb-2">
                    <input type="file" accept="video/*,audio/*" onChange={handleFileUpload} className="hidden" id="media-upload" />
                    <label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center">
                        <Video size={32} className="text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-600 dark:text-gray-300">
                            {mediaFile ? mediaFile.name : "Drop Video or Audio file"}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">Max 50MB</span>
                    </label>
                </div>
                <Button onClick={handleAnalyzeMedia} disabled={!mediaFile || isGenerating} className="w-full justify-center" icon={Sparkles}>
                    Analyze File
                </Button>
            </div>
          </div>
        </Card>

        {transcriptAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="space-y-4">
               <h4 className="font-bold text-accent uppercase text-xs tracking-wide">Viral Clips Found</h4>
               {transcriptAnalysis.clips.map((clip, i) => (
                 <div key={i} className="p-4 bg-white/50 dark:bg-white/5 border border-accent/20 rounded-xl">
                    <div className="flex justify-between text-xs font-mono text-accent font-bold mb-2">
                       <span>{clip.startTime} - {clip.endTime}</span>
                    </div>
                    <p className="text-sm italic mb-2">"{clip.quote}"</p>
                    <p className="text-xs text-slate-500">Why: {clip.reason}</p>
                 </div>
               ))}
            </div>
            <div className="space-y-4">
               <h4 className="font-bold text-red-400 uppercase text-xs tracking-wide">Verbal Tics</h4>
               <div className="p-4 bg-white/50 dark:bg-white/5 border border-red-500/10 rounded-xl">
                 <div className="flex flex-wrap gap-2">
                   {Object.entries(transcriptAnalysis.tics).map(([word, count]) => (
                     <span key={word} className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium">
                       "{word}": {count}
                     </span>
                   ))}
                 </div>
               </div>
               <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wide">Show Notes Summary</h4>
               <div className="p-4 bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm">
                 {transcriptAnalysis.summary}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
