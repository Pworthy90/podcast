import React, { useState } from 'react';
import { 
  Calendar, Plus, FileText, Clock, Instagram, RefreshCw, 
  ChevronRight, PlayCircle, CheckCircle, BarChart2, Search, ShieldCheck, Wand2, Radio, Target, Globe, BookOpen
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Button, Card, RichTextRenderer, Input } from './Shared';
import { Season, Episode, ArcPoint, AdInsertionPoint, ViewState } from '../types';
import { geminiService } from '../services/geminiService';

interface SeasonPlannerProps {
  seasons: Season[];
  setSeasons: React.Dispatch<React.SetStateAction<Season[]>>;
  selectedEpisode: Episode | null;
  setSelectedEpisode: (ep: Episode | null) => void;
  onNavigate: (view: ViewState) => void;
}

export const SeasonPlanner = ({ seasons, setSeasons, selectedEpisode, setSelectedEpisode, onNavigate }: SeasonPlannerProps) => {
  // UI State
  const [activeTab, setActiveTab] = useState<'SCRIPT' | 'RUNSHEET' | 'SOCIAL' | 'REPURPOSE' | 'REVIEW'>('SCRIPT');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // For social preview
  
  // Season View State
  const [viewMode, setViewMode] = useState<'EPISODES' | 'STRATEGY'>('EPISODES');
  const [seasonGoal, setSeasonGoal] = useState('Reach new believers and deepen faith');
  const [targetAudience, setTargetAudience] = useState('Young professionals, 25-35');
  const [seasonVerse, setSeasonVerse] = useState('Romans 12:2');
  
  // Data State for Arc Viz
  const [arcData, setArcData] = useState<ArcPoint[]>([]);

  // Helpers
  const updateEpisode = (seasonId: string, episodeId: string, updates: Partial<Episode>) => {
    setSeasons(prev => prev.map(s => {
      if (s.id !== seasonId) return s;
      return {
        ...s,
        episodes: s.episodes.map(e => e.id === episodeId ? { ...e, ...updates } : e)
      };
    }));
    // Update selected if matches
    if (selectedEpisode && selectedEpisode.id === episodeId) {
      setSelectedEpisode({ ...selectedEpisode, ...updates });
    }
  };

  // AI Actions
  const handleGenerateOutline = async (seasonId: string, episode: Episode) => {
    setIsGenerating(true);
    const outline = await geminiService.generateEpisodeOutline(episode.title, episode.theme);
    updateEpisode(seasonId, episode.id, { outline, status: 'Scripted' });
    setIsGenerating(false);
  };

  const handleGenerateRunSheet = async (seasonId: string, episode: Episode) => {
    setIsGenerating(true);
    const runSheet = await geminiService.generateRunSheet(episode.title, episode.theme);
    updateEpisode(seasonId, episode.id, { runSheet });
    setIsGenerating(false);
  };

  const handleGenerateSocial = async (seasonId: string, episode: Episode) => {
    setIsGenerating(true);
    const socialPack = await geminiService.generateSocialPack(episode.title, episode.theme);
    if (socialPack) updateEpisode(seasonId, episode.id, { socialPack });
    setIsGenerating(false);
  };

  const handleFindAdSlots = async (seasonId: string, episode: Episode) => {
    if (!episode.outline) return;
    setIsGenerating(true);
    const adSlots = await geminiService.findAdSlots(episode.outline);
    updateEpisode(seasonId, episode.id, { adSlots });
    setIsGenerating(false);
  };

  const handleRepurpose = async (type: 'NEWSLETTER' | 'BLOG', seasonId: string, episode: Episode) => {
    if (!episode.outline) return;
    setIsGenerating(true);
    let content = "";
    if (type === 'NEWSLETTER') {
       content = await geminiService.generateNewsletter(episode.title, episode.outline);
       updateEpisode(seasonId, episode.id, { newsletter: content });
    } else {
       content = await geminiService.generateBlogPost(episode.title, episode.outline);
       updateEpisode(seasonId, episode.id, { blogPost: content });
    }
    setIsGenerating(false);
  };

  const handleReviewTheology = async (seasonId: string, episode: Episode) => {
    if (!episode.outline) return;
    setIsGenerating(true);
    const review = await geminiService.reviewTheology(episode.outline);
    updateEpisode(seasonId, episode.id, { theologicalReview: review });
    setIsGenerating(false);
  };

  const handleAnalyzeArc = async (season: Season) => {
     setIsGenerating(true);
     const points = await geminiService.analyzeSeasonArc(season.episodes);
     setArcData(points);
     setIsGenerating(false);
  };

  const handleAddEpisode = (seasonId: string) => {
     const newEp: Episode = {
       id: `e-${Date.now()}`,
       title: 'New Episode',
       theme: 'TBD',
       status: 'Draft'
     };
     setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, episodes: [...s.episodes, newEp]} : s));
  };

  // Action Card Component for Empty States
  const ActionCard = ({ icon: Icon, title, desc, onAction, btnText, colorClass }: any) => (
    <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/5 dark:bg-white/5">
       <div className={`p-4 rounded-full bg-white dark:bg-white/10 mb-4 ${colorClass}`}>
          <Icon size={32} />
       </div>
       <h3 className="text-xl font-bold mb-2">{title}</h3>
       <p className="text-slate-500 dark:text-gray-400 max-w-sm mb-6">{desc}</p>
       <Button onClick={onAction} disabled={isGenerating} icon={Wand2}>
          {isGenerating ? 'Thinking...' : btnText}
       </Button>
    </div>
  );

  // Renders
  const renderDetailView = () => {
    if (!selectedEpisode) return null;
    const season = seasons.find(s => s.episodes.find(e => e.id === selectedEpisode.id));
    if (!season) return null;

    return (
      <div className="flex flex-col h-full animate-fadeIn">
         <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <button onClick={() => setSelectedEpisode(null)} className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">Back</button>
                <ChevronRight size={16} className="text-slate-400"/>
                <span className="font-bold text-slate-900 dark:text-white">Episode Planner: {selectedEpisode.title}</span>
             </div>
             <Button variant="secondary" icon={Radio} className="text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10" onClick={() => onNavigate(ViewState.STUDIO)}>Go to Studio</Button>
         </div>

         <div className="flex gap-2 mb-6 border-b border-black/5 dark:border-white/10 pb-1 overflow-x-auto">
            {[
              { id: 'SCRIPT', label: 'Script Outline', icon: FileText },
              { id: 'RUNSHEET', label: 'Run Sheet', icon: Clock },
              { id: 'SOCIAL', label: 'Social Pack', icon: Instagram },
              { id: 'REPURPOSE', label: 'Repurpose', icon: RefreshCw },
              { id: 'REVIEW', label: 'Theology Check', icon: ShieldCheck },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === t.id 
                  ? 'border-accent text-accent bg-accent/5' 
                  : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {/* SCRIPT TAB */}
            {activeTab === 'SCRIPT' && (
              <div className="space-y-6">
                 {!selectedEpisode.outline ? (
                    <ActionCard 
                       icon={FileText} 
                       title="Generate Script Outline" 
                       desc="Create a detailed minute-by-minute outline, including hooks, scripture readings, and discussion points."
                       onAction={() => handleGenerateOutline(season.id, selectedEpisode)}
                       btnText="Generate Outline"
                       colorClass="text-blue-500"
                    />
                 ) : (
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 prose prose-slate dark:prose-invert max-w-none">
                         <div className="bg-white dark:bg-white/5 p-8 rounded-xl shadow-sm border border-black/5 dark:border-white/5">
                            <RichTextRenderer content={selectedEpisode.outline} />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <Card>
                            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2"><Search size={16}/> Ad Placement</h4>
                            {!selectedEpisode.adSlots ? (
                               <div className="text-center py-4">
                                 <p className="text-xs text-slate-500 mb-4">Find natural breaks for sponsors.</p>
                                 <Button variant="secondary" className="w-full justify-center" onClick={() => handleFindAdSlots(season.id, selectedEpisode)} disabled={isGenerating}>Find Ad Slots</Button>
                               </div>
                            ) : (
                               <div className="space-y-3">
                                  {selectedEpisode.adSlots.map((slot, i) => (
                                    <div key={i} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                                       <p className="font-bold text-green-600 mb-1">Suggested Break {i+1}</p>
                                       <p className="text-xs italic opacity-70 mb-2">"{slot.context}"</p>
                                       <p className="text-xs text-slate-700 dark:text-gray-300">Use transition: "{slot.suggestedTransition}"</p>
                                    </div>
                                  ))}
                               </div>
                            )}
                         </Card>
                      </div>
                   </div>
                 )}
              </div>
            )}

            {/* RUN SHEET TAB */}
            {activeTab === 'RUNSHEET' && (
               <div className="h-full">
                  {!selectedEpisode.runSheet ? (
                    <ActionCard 
                       icon={Clock} 
                       title="Create Run Sheet" 
                       desc="Generate a timed minute-by-minute breakdown for the host to follow during recording."
                       onAction={() => handleGenerateRunSheet(season.id, selectedEpisode)}
                       btnText="Generate Run Sheet"
                       colorClass="text-orange-500"
                    />
                  ) : (
                    <div className="bg-white dark:bg-white/5 rounded-xl overflow-hidden border border-black/5 dark:border-white/5">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-black/5 dark:bg-white/5 text-xs uppercase font-bold text-slate-500">
                             <tr>
                                <th className="p-4">Time</th>
                                <th className="p-4">Segment</th>
                                <th className="p-4">Notes</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 dark:divide-white/5">
                             {selectedEpisode.runSheet.map((row, i) => (
                               <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5">
                                  <td className="p-4 font-mono font-bold text-accent">{row.time}</td>
                                  <td className="p-4 font-bold">{row.segment}</td>
                                  <td className="p-4 text-slate-600 dark:text-gray-300">{row.notes}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  )}
               </div>
            )}

            {/* SOCIAL TAB */}
            {activeTab === 'SOCIAL' && (
               <div className="h-full">
                 {!selectedEpisode.socialPack ? (
                    <ActionCard 
                       icon={Instagram} 
                       title="Social Media Pack" 
                       desc="Generate YouTube titles, Instagram captions, and a TikTok script tailored to this episode."
                       onAction={() => handleGenerateSocial(season.id, selectedEpisode)}
                       btnText="Generate Pack"
                       colorClass="text-pink-500"
                    />
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-6">
                          <div className="flex justify-between items-center">
                             <h3 className="font-bold">Generated Content</h3>
                             <Button variant="ghost" onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Hide Preview' : 'Show Preview'}</Button>
                          </div>
                          
                          <Card>
                             <h4 className="font-bold text-red-500 mb-2 text-xs uppercase">YouTube</h4>
                             <div className="space-y-2 mb-4">
                                {selectedEpisode.socialPack.youtube.titles.map((t, i) => (
                                   <div key={i} className="p-2 bg-black/5 dark:bg-white/5 rounded text-sm font-medium">{t}</div>
                                ))}
                             </div>
                             <p className="text-xs text-slate-500">{selectedEpisode.socialPack.youtube.description}</p>
                          </Card>

                          <Card>
                             <h4 className="font-bold text-pink-500 mb-2 text-xs uppercase">Instagram Caption</h4>
                             <p className="text-sm whitespace-pre-wrap">{selectedEpisode.socialPack.instagram.caption}</p>
                          </Card>
                       </div>

                       {showPreview && (
                          <div className="bg-black rounded-[3rem] border-8 border-slate-800 w-72 mx-auto overflow-hidden shadow-2xl relative aspect-[9/19]">
                             <div className="absolute top-0 w-full h-6 bg-transparent z-20 flex justify-center"><div className="w-20 h-6 bg-black rounded-b-xl"></div></div>
                             {/* Mock Instagram UI */}
                             <div className="h-full bg-white text-black flex flex-col pt-12 px-4 pb-8 overflow-y-auto no-scrollbar">
                                <div className="flex items-center gap-2 mb-4">
                                   <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full"></div>
                                   <span className="font-bold text-sm">inthemidpod</span>
                                </div>
                                <div className="w-full aspect-square bg-slate-100 rounded-sm mb-2 flex items-center justify-center text-center p-4">
                                   <p className="font-serif text-lg leading-tight">{selectedEpisode.socialPack.instagram.carouselText[0] || "Title Slide"}</p>
                                </div>
                                <div className="flex gap-3 mb-2">
                                   <div className="w-6 h-6">❤️</div>
                                   <div className="w-6 h-6">💬</div>
                                   <div className="w-6 h-6">✈️</div>
                                </div>
                                <p className="text-xs">
                                   <span className="font-bold mr-1">inthemidpod</span>
                                   {selectedEpisode.socialPack.instagram.caption.substring(0, 100)}...
                                </p>
                             </div>
                          </div>
                       )}
                    </div>
                 )}
               </div>
            )}

            {/* REPURPOSE TAB */}
            {activeTab === 'REPURPOSE' && (
               <div className="space-y-6 h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                     <div className="flex flex-col h-full">
                        <h4 className="font-bold mb-4 text-slate-500 uppercase text-xs tracking-wider">Email Content</h4>
                        {!selectedEpisode.newsletter ? (
                           <ActionCard 
                              icon={FileText} 
                              title="Devotional Email" 
                              desc="Turn this episode into a Monday morning devotional."
                              onAction={() => handleRepurpose('NEWSLETTER', season.id, selectedEpisode)}
                              btnText="Write Email"
                              colorClass="text-green-500"
                           />
                        ) : (
                           <div className="text-sm max-h-[500px] overflow-y-auto bg-white dark:bg-white/5 p-6 border border-black/10 dark:border-white/10 rounded-xl shadow-sm">
                              <RichTextRenderer content={selectedEpisode.newsletter} />
                           </div>
                        )}
                     </div>
                     <div className="flex flex-col h-full">
                        <h4 className="font-bold mb-4 text-slate-500 uppercase text-xs tracking-wider">Web Content</h4>
                        {!selectedEpisode.blogPost ? (
                           <ActionCard 
                              icon={Globe} 
                              title="SEO Blog Post" 
                              desc="Convert the transcript outline into a structured article."
                              onAction={() => handleRepurpose('BLOG', season.id, selectedEpisode)}
                              btnText="Write Post"
                              colorClass="text-purple-500"
                           />
                        ) : (
                           <div className="text-sm max-h-[500px] overflow-y-auto bg-white dark:bg-white/5 p-6 border border-black/10 dark:border-white/10 rounded-xl shadow-sm">
                              <RichTextRenderer content={selectedEpisode.blogPost} />
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {/* REVIEW TAB */}
            {activeTab === 'REVIEW' && (
               <div className="h-full">
                  {!selectedEpisode.theologicalReview ? (
                     <ActionCard 
                        icon={ShieldCheck} 
                        title="Theological Safety Net" 
                        desc="AI Seminary Professor reviews your outline for biblical accuracy and balance."
                        onAction={() => handleReviewTheology(season.id, selectedEpisode)}
                        btnText="Start Review"
                        colorClass="text-yellow-500"
                     />
                  ) : (
                     <div className="bg-white dark:bg-white/5 p-8 rounded-xl border border-black/5 dark:border-white/10">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldCheck className="text-accent"/> Review Report</h3>
                        <RichTextRenderer content={selectedEpisode.theologicalReview} />
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
    );
  };

  const renderStrategyView = (season: Season) => (
    <div className="animate-fadeIn space-y-6 overflow-y-auto h-full pb-20 custom-scrollbar">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Target className="text-accent"/> Season Goals</h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Overarching Theme</label>
                   <Input value={seasonGoal} onChange={(e) => setSeasonGoal(e.target.value)} />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Audience</label>
                   <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Anchor Scripture</label>
                   <div className="flex gap-2">
                      <Input value={seasonVerse} onChange={(e) => setSeasonVerse(e.target.value)} className="font-mono" />
                      <Button variant="secondary" icon={BookOpen}>Read</Button>
                   </div>
                </div>
             </div>
          </Card>
          <Card>
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg flex items-center gap-2"><BarChart2 size={20} className="text-accent"/> Intensity Arc</h3>
                 <Button variant="ghost" className="text-xs" onClick={() => handleAnalyzeArc(season)} disabled={isGenerating}>
                    {isGenerating ? 'Analyzing...' : 'Analyze Flow'}
                 </Button>
             </div>
             <div className="h-48">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={arcData.length > 0 ? arcData : season.episodes.map((e,i) => ({ episode: i+1, title: e.title, intensity: 5, depth: 5 }))}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="title" hide />
                       <YAxis domain={[0, 10]} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)' }} />
                       <Line type="monotone" dataKey="intensity" stroke="#ef4444" strokeWidth={2} dot={{r:4}} name="Emotional Intensity" />
                       <Line type="monotone" dataKey="depth" stroke="#8b5cf6" strokeWidth={2} dot={{r:4}} name="Theological Depth" />
                    </LineChart>
                 </ResponsiveContainer>
             </div>
             <p className="text-xs text-slate-500 mt-4 italic">Visualizing the emotional and intellectual pacing of your season to prevent listener fatigue.</p>
          </Card>
       </div>

       <Card>
          <h3 className="text-xl font-bold mb-4">Season Roadmap</h3>
          <div className="space-y-3">
             {season.episodes.map((ep, i) => (
                <div key={ep.id} className="flex items-center gap-4 p-3 bg-white/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                   <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-slate-500">{i+1}</div>
                   <div className="flex-1">
                      <p className="font-bold">{ep.title}</p>
                      <p className="text-xs text-slate-500">{ep.theme}</p>
                   </div>
                   <div className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded text-slate-500">{ep.status}</div>
                </div>
             ))}
          </div>
       </Card>
    </div>
  );

  // List View
  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Season Planner</h2>
          <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-lg">
             <button 
               onClick={() => setViewMode('EPISODES')}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'EPISODES' ? 'bg-white dark:bg-white/20 shadow-sm text-slate-900 dark:text-white' : 'opacity-60 hover:opacity-100'
               }`}
             >
               Episodes
             </button>
             <button 
               onClick={() => setViewMode('STRATEGY')}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'STRATEGY' ? 'bg-white dark:bg-white/20 shadow-sm text-slate-900 dark:text-white' : 'opacity-60 hover:opacity-100'
               }`}
             >
               Strategy
             </button>
          </div>
      </div>
      
      {selectedEpisode ? (
         renderDetailView()
      ) : (
         viewMode === 'STRATEGY' ? renderStrategyView(seasons[0]) : (
         <div className="space-y-8 overflow-y-auto custom-scrollbar pb-10">
            {seasons.map(season => (
               <div key={season.id} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 py-2">
                     Season {season.number}: {season.title}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                     {season.episodes.map((episode, index) => (
                        <div 
                           key={episode.id} 
                           onClick={() => setSelectedEpisode(episode)}
                           className="group flex items-center gap-4 p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl hover:border-accent/50 hover:shadow-lg dark:hover:bg-white/10 transition-all cursor-pointer"
                        >
                           <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-sm text-slate-500">
                              {index + 1}
                           </div>
                           <div className="flex-1">
                              <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-accent transition-colors">{episode.title}</h4>
                              <p className="text-sm text-slate-500 dark:text-gray-400">Theme: {episode.theme}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              {/* Status Badge */}
                              <select 
                                 onClick={(e) => e.stopPropagation()}
                                 value={episode.status}
                                 onChange={(e) => updateEpisode(season.id, episode.id, { status: e.target.value as any })}
                                 className={`text-xs font-bold px-3 py-1 rounded-full bg-transparent border appearance-none cursor-pointer ${
                                    episode.status === 'Published' ? 'border-green-500 text-green-500' :
                                    episode.status === 'Recorded' ? 'border-blue-500 text-blue-500' :
                                    episode.status === 'Scripted' ? 'border-purple-500 text-purple-500' :
                                    'border-slate-500 text-slate-500'
                                 }`}
                              >
                                 <option value="Draft">Draft</option>
                                 <option value="Scripted">Scripted</option>
                                 <option value="Recorded">Recorded</option>
                                 <option value="Published">Published</option>
                              </select>
                              
                              {/* Indicators */}
                              <div className="flex gap-1 text-slate-400">
                                 <FileText size={14} className={episode.outline ? "text-accent" : "opacity-20"} />
                                 <Clock size={14} className={episode.runSheet ? "text-accent" : "opacity-20"} />
                                 <Instagram size={14} className={episode.socialPack ? "text-accent" : "opacity-20"} />
                              </div>
                              
                              <ChevronRight size={20} className="text-slate-300 group-hover:text-accent" />
                           </div>
                        </div>
                     ))}
                     <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => handleAddEpisode(season.id)}
                         className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl text-slate-500 hover:text-accent hover:border-accent/50 transition-all"
                       >
                          <Plus size={20} /> Add Episode
                       </button>
                       <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/5 transition-all">
                          <Wand2 size={20} /> Panic Button
                       </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
         )
      )}
    </div>
  );
};