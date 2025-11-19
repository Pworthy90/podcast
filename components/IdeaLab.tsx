import React, { useState } from 'react';
import { 
  Sparkles, BookOpen, Users, Instagram, Search, 
  Lightbulb, Zap, ShoppingBag, Image, ArrowRight, Copy
} from 'lucide-react';
import { Button, Card, Input } from './Shared';
import { IdeaTab, ExegeticalAnalysis } from '../types';
import { geminiService } from '../services/geminiService';

export const IdeaLab = () => {
  const [ideaInput, setIdeaInput] = useState('');
  const [selectedIdeaTab, setSelectedIdeaTab] = useState<IdeaTab>(IdeaTab.TOPICS);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Results State - utilizing a union type approach for flexibility
  const [generatedIdeas, setGeneratedIdeas] = useState<any[] | any | null>(null);

  const handleGenerate = async () => {
    if (!ideaInput) return;
    setIsGenerating(true);
    setGeneratedIdeas(null);

    try {
      let result;
      switch (selectedIdeaTab) {
        case IdeaTab.VERSE:
          result = await geminiService.generateVerseGuide(ideaInput);
          break;
        case IdeaTab.METAPHORS:
          result = await geminiService.generateMetaphors(ideaInput);
          break;
        case IdeaTab.CONTROVERSY:
          result = await geminiService.generateControversy(ideaInput);
          break;
        case IdeaTab.RESEARCH:
          result = await geminiService.generateExegeticalAnalysis(ideaInput);
          break;
        default:
          result = await geminiService.generateIdeas(selectedIdeaTab, ideaInput);
      }
      setGeneratedIdeas(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: IdeaTab.TOPICS, icon: Lightbulb, label: 'Topics' },
    { id: IdeaTab.VERSE, icon: BookOpen, label: 'Verse First' },
    { id: IdeaTab.GUESTS, icon: Users, label: 'Guest Scout' },
    { id: IdeaTab.SOCIAL, icon: Instagram, label: 'Social' },
    { id: IdeaTab.METAPHORS, icon: Zap, label: 'Metaphors' },
    { id: IdeaTab.CONTROVERSY, icon: Search, label: 'Devil\'s Advocate' },
    { id: IdeaTab.RESEARCH, icon: BookOpen, label: 'Research' },
    { id: IdeaTab.MERCH, icon: ShoppingBag, label: 'Merch' },
    { id: IdeaTab.THUMBNAIL, icon: Image, label: 'Thumbnail' },
  ];

  const renderResults = () => {
    if (!generatedIdeas) return null;

    // Special Render: Verse Guide
    if (selectedIdeaTab === IdeaTab.VERSE) {
       const guide = generatedIdeas as any;
       return (
         <div className="animate-slideUp space-y-4">
            <div className="p-6 bg-white dark:bg-white/5 border border-purple-500/30 rounded-xl shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
               <h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">{guide.title}</h3>
               <p className="text-purple-500 dark:text-purple-400 font-medium mb-4 uppercase tracking-wide text-xs">Theme: {guide.theme}</p>
               
               <div className="mb-4">
                 <h4 className="font-bold text-sm uppercase text-slate-400 mb-2">Discussion Questions</h4>
                 <ul className="space-y-2">
                   {guide.questions?.map((q: string, i: number) => (
                     <li key={i} className="flex gap-3 text-slate-700 dark:text-gray-300 text-sm md:text-base">
                       <span className="text-purple-500 font-bold min-w-[1.5rem]">{i+1}.</span> {q}
                     </li>
                   ))}
                 </ul>
               </div>
               <div className="flex justify-end">
                 <Button variant="secondary" className="text-xs">Save to Planner</Button>
               </div>
            </div>
         </div>
       );
    }

    // Special Render: Research / Exegesis
    if (selectedIdeaTab === IdeaTab.RESEARCH) {
      const analysis = generatedIdeas as ExegeticalAnalysis;
      return (
        <div className="animate-slideUp space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10">
                 <h4 className="font-bold text-accent mb-3 flex items-center gap-2"><BookOpen size={16}/> Original Language</h4>
                 {analysis.originalLanguage?.map((word, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                       <p className="font-bold text-lg text-slate-900 dark:text-white">{word.word} <span className="text-sm font-normal opacity-50">({word.pronunciation})</span></p>
                       <p className="text-sm text-slate-600 dark:text-gray-400">{word.definition}</p>
                    </div>
                 ))}
              </div>
              <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10">
                 <h4 className="font-bold text-accent mb-3 flex items-center gap-2"><Search size={16}/> Context</h4>
                 <p className="text-sm leading-relaxed text-slate-700 dark:text-gray-300">{analysis.historicalContext}</p>
              </div>
           </div>
           <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10">
              <h4 className="font-bold text-accent mb-3">Cross References</h4>
              <div className="grid grid-cols-1 gap-2">
                 {analysis.crossReferences?.map((ref, i) => (
                   <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="font-mono font-bold bg-accent/10 text-accent px-2 py-1 rounded shrink-0">{ref.verse}</span>
                      <span className="text-slate-600 dark:text-gray-400">{ref.connection}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )
    }

    // Special Render: Metaphors
    if (selectedIdeaTab === IdeaTab.METAPHORS) {
       return (
         <div className="grid grid-cols-1 gap-4 animate-slideUp">
           {generatedIdeas.map((m: any, i: number) => (
             <Card key={i} className="border-l-4 border-l-accent">
                <h4 className="font-bold text-accent uppercase text-xs tracking-wider mb-2">{m.type}</h4>
                <p className="text-lg font-medium italic text-slate-800 dark:text-gray-200">"{m.analogy}"</p>
             </Card>
           ))}
         </div>
       )
    }

    // Special Render: Controversy
    if (selectedIdeaTab === IdeaTab.CONTROVERSY) {
      return (
        <div className="space-y-4 animate-slideUp">
          {generatedIdeas.map((item: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <h4 className="text-red-500 font-bold text-xs uppercase mb-2">Skeptic Says</h4>
                  <p className="text-sm font-medium">"{item.argument}"</p>
               </div>
               <div className="hidden md:flex items-center text-slate-400"><ArrowRight size={20}/></div>
               <div className="flex md:hidden items-center justify-center text-slate-400"><ArrowRight size={20} className="rotate-90"/></div>
               <div className="flex-1 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <h4 className="text-green-500 font-bold text-xs uppercase mb-2">Gracious Defense</h4>
                  <p className="text-sm">{item.defense}</p>
               </div>
            </div>
          ))}
        </div>
      )
    }

    // Standard Array Render (Topics, Social, Merch, etc)
    if (Array.isArray(generatedIdeas)) {
      return (
        <div className="grid grid-cols-1 gap-3 animate-slideUp">
          {generatedIdeas.map((item: any, i: number) => (
            <div key={i} className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl hover:border-accent/50 transition-all flex justify-between items-center group">
              <p className="font-medium text-slate-700 dark:text-gray-200 pr-4">
                {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
              </p>
              <button className="p-2 text-slate-400 hover:text-accent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy size={16} />
              </button>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full gap-6 pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Idea Lab</h2>
          <p className="text-slate-500 dark:text-gray-400">AI-powered creative suite for brainstorming.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto custom-scrollbar md:pr-2 shrink-0">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => { setSelectedIdeaTab(tab.id); setGeneratedIdeas(null); }}
               className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                 selectedIdeaTab === tab.id 
                 ? 'bg-accent text-white shadow-md' 
                 : 'text-slate-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
               }`}
             >
               <tab.icon size={18} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
           <Card>
              <div className="flex flex-col md:flex-row gap-4">
                 <Input 
                   placeholder={
                     selectedIdeaTab === IdeaTab.VERSE ? "Enter a verse (e.g. John 3:16)..." :
                     selectedIdeaTab === IdeaTab.METAPHORS ? "Enter a concept (e.g. Grace)..." :
                     "Enter a topic or keyword..."
                   }
                   value={ideaInput}
                   onChange={(e: any) => setIdeaInput(e.target.value)}
                   onKeyDown={(e: any) => e.key === 'Enter' && handleGenerate()}
                 />
                 <Button onClick={handleGenerate} disabled={!ideaInput || isGenerating} icon={Sparkles} className="w-full md:w-auto">
                   {isGenerating ? 'Thinking...' : 'Generate'}
                 </Button>
              </div>
           </Card>

           <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
              {generatedIdeas ? (
                renderResults()
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40 p-8 text-center">
                   <Lightbulb size={64} className="mb-4" />
                   <p className="text-xl font-bold">Spark something new.</p>
                   <p className="text-sm">Select a tool and enter a prompt.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};