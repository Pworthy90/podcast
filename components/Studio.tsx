import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Volume2, Flag, ThumbsUp, ThumbsDown, Smile, Scissors } from 'lucide-react';
import { Button, Card } from './Shared';
import { Episode, StudioMarker } from '../types';

interface StudioProps {
  selectedEpisode: Episode | null;
  seasons: any[];
  setSelectedEpisode: (ep: Episode) => void;
}

export const Studio = ({ selectedEpisode, seasons, setSelectedEpisode }: StudioProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [studioMarkers, setStudioMarkers] = useState<StudioMarker[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Timer isolation: Only runs in this component
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Speech Recognition
  useEffect(() => {
    if (isTranscribing) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          setLiveTranscription(prev => prev + (finalTranscript ? ' ' + finalTranscript : ''));
        };
        recognitionRef.current.start();
      }
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
    }
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); }
  }, [isTranscribing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Singleton Audio Context Fix
  const playSound = (type: 'beep' | 'swoosh' | 'chime') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'swoosh') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  const addMarker = (label: string, type: 'good' | 'bad' | 'funny' | 'edit') => {
     setStudioMarkers(prev => [...prev, { id: `m-${Date.now()}`, time: recordingTime, label, type }]);
  };

  return (
    <div className="flex flex-col h-full gap-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            Studio Mode 
            {isRecording && <span className="text-xs md:text-sm font-normal text-red-500 animate-pulse px-2 py-0.5 bg-red-500/10 rounded-full flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> ON AIR</span>}
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Distraction-free recording interface.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button 
             variant={isTranscribing ? 'secondary' : 'ghost'} 
             onClick={() => setIsTranscribing(!isTranscribing)}
             className="text-xs md:text-sm flex-1 md:flex-none"
          >
             {isTranscribing ? 'Stop Transcribe' : 'Live Transcribe'}
          </Button>
          <div className="text-3xl md:text-4xl font-mono font-bold text-slate-900 dark:text-white tabular-nums tracking-wider">
            {formatTime(recordingTime)}
          </div>
          <Button 
            variant={isRecording ? 'danger' : 'primary'}
            onClick={() => setIsRecording(!isRecording)}
            icon={isRecording ? Square : Mic}
            className={`flex-1 md:flex-none ${isRecording ? "animate-pulse" : ""}`}
          >
            {isRecording ? 'Stop' : 'Record'}
          </Button>
        </div>
      </div>

      {isTranscribing && (
         <div className="bg-black/80 border border-white/10 rounded-lg p-4 mb-2 h-24 overflow-y-auto text-white/80 font-mono text-lg leading-relaxed animate-fadeIn">
            {liveTranscription || <span className="italic opacity-50">Listening...</span>}
         </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        <div className="flex-1 bg-white dark:bg-black rounded-2xl border border-black/10 dark:border-white/10 shadow-inner overflow-hidden flex flex-col relative min-h-[300px]">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
             <h3 className="font-bold text-slate-700 dark:text-gray-300 text-sm md:text-base">
               {selectedEpisode ? selectedEpisode.title : "No Episode Selected"}
             </h3>
          </div>
          
          {isRecording && (
             <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex flex-wrap gap-2 md:gap-3 z-10 justify-end">
                <button onClick={() => addMarker('Good Take', 'good')} className="p-3 md:p-4 bg-green-500 rounded-full shadow-lg hover:scale-110 transition-all text-white"><ThumbsUp size={20}/></button>
                <button onClick={() => addMarker('Retake', 'bad')} className="p-3 md:p-4 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-all text-white"><ThumbsDown size={20}/></button>
                <button onClick={() => addMarker('Funny', 'funny')} className="p-3 md:p-4 bg-yellow-500 rounded-full shadow-lg hover:scale-110 transition-all text-white"><Smile size={20}/></button>
                <button onClick={() => addMarker('Edit Point', 'edit')} className="p-3 md:p-4 bg-blue-500 rounded-full shadow-lg hover:scale-110 transition-all text-white"><Scissors size={20}/></button>
             </div>
          )}

          <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar">
            {selectedEpisode?.outline ? (
              <div className="max-w-3xl mx-auto prose prose-lg md:prose-xl dark:prose-invert pb-20">
                 <pre className="whitespace-pre-wrap font-sans leading-loose text-slate-800 dark:text-gray-100">
                   {selectedEpisode.outline}
                 </pre>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-gray-600">
                <p>Select an episode to view script.</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4 lg:h-full overflow-y-auto">
          <Card className="flex-1">
             {studioMarkers.length > 0 && (
               <div className="mb-6">
                 <h4 className="font-bold mb-2 text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <Flag size={16}/> Markers
                 </h4>
                 <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                   {studioMarkers.map(m => (
                     <div key={m.id} className="flex justify-between text-xs p-2 bg-black/5 dark:bg-white/10 rounded">
                        <span className="font-mono font-bold">{formatTime(m.time)}</span>
                        <span className={`font-bold ${
                          m.type === 'good' ? 'text-green-500' : 
                          m.type === 'bad' ? 'text-red-500' : 
                          m.type === 'funny' ? 'text-yellow-500' : 'text-blue-500'
                        }`}>{m.label}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}

            <h4 className="font-bold mb-4 text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Volume2 size={16}/> Soundboard
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
               <button onClick={() => playSound('beep')} className="h-16 rounded-xl bg-purple-500 text-white font-bold shadow-lg hover:bg-purple-600 active:scale-95 transition-all">BEEP</button>
               <button onClick={() => playSound('swoosh')} className="h-16 rounded-xl bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-600 active:scale-95 transition-all">SWOOSH</button>
               <button onClick={() => playSound('chime')} className="h-16 rounded-xl bg-green-500 text-white font-bold shadow-lg hover:bg-green-600 active:scale-95 transition-all">CHIME</button>
               <button className="h-16 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400 border border-dashed border-black/10 dark:border-white/10">+ Add</button>
            </div>

            <h4 className="font-bold mb-4 text-slate-900 dark:text-white text-sm uppercase tracking-wider">Queue</h4>
            <div className="space-y-2">
              {seasons.flatMap(s => s.episodes).map(ep => (
                <button 
                  key={ep.id}
                  onClick={() => setSelectedEpisode(ep)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                    selectedEpisode?.id === ep.id 
                    ? 'bg-accent text-white border-accent' 
                    : 'bg-white/5 border-transparent hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300'
                  }`}
                >
                  <p className="font-bold truncate">{ep.title}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};