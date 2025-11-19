import React, { useState } from 'react';
import { DollarSign, Send, Mic, CheckCircle, XCircle, Clock, Plus, Sparkles, Search } from 'lucide-react';
import { Button, Card, Input } from './Shared';
import { Sponsor } from '../types';
import { MOCK_SPONSORS } from '../mockData';
import { geminiService } from '../services/geminiService';

export const Sponsorships = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>(MOCK_SPONSORS);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generator State
  const [draftEmail, setDraftEmail] = useState('');
  const [adRead, setAdRead] = useState('');
  const [adTone, setAdTone] = useState('Funny');
  const [adContext, setAdContext] = useState('General Episode');

  // Scout State
  const [scoutNiche, setScoutNiche] = useState('');
  const [sponsorIdeas, setSponsorIdeas] = useState<any[]>([]);

  const updateSponsor = (id: string, updates: Partial<Sponsor>) => {
    setSponsors(sponsors.map(s => s.id === id ? { ...s, ...updates } : s));
    if (selectedSponsor?.id === id) setSelectedSponsor({ ...selectedSponsor, ...updates });
  };

  const handleAddSponsor = () => {
    const newSponsor: Sponsor = {
      id: `sp-${Date.now()}`,
      name: 'New Sponsor',
      industry: 'TBD',
      status: 'Prospect',
      notes: ''
    };
    setSponsors([...sponsors, newSponsor]);
    setSelectedSponsor(newSponsor);
  };

  const handleDraftEmail = async () => {
    if (!selectedSponsor) return;
    setIsGenerating(true);
    const email = await geminiService.draftSponsorEmail(selectedSponsor.name, selectedSponsor.industry, selectedSponsor.notes);
    setDraftEmail(email);
    setIsGenerating(false);
  };

  const handleGenerateAd = async () => {
    if (!selectedSponsor) return;
    setIsGenerating(true);
    const script = await geminiService.generateAdRead(selectedSponsor.name, selectedSponsor.industry, adContext, adTone);
    setAdRead(script);
    setIsGenerating(false);
  };

  const handleScoutSponsors = async () => {
    if (!scoutNiche) return;
    setIsGenerating(true);
    const ideas = await geminiService.generateSponsorIdeas(scoutNiche);
    setSponsorIdeas(ideas);
    setIsGenerating(false);
  };

  const addIdeaToCRM = (idea: any) => {
    const newSponsor: Sponsor = {
      id: `sp-${Date.now()}`,
      name: idea.name,
      industry: idea.industry,
      status: 'Prospect',
      notes: `AI Suggestion: ${idea.reason}`
    };
    setSponsors([...sponsors, newSponsor]);
    setSponsorIdeas(prev => prev.filter(i => i.name !== idea.name));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
         <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Sponsorships</h2>
         <Button onClick={handleAddSponsor} icon={Plus}>Add Sponsor</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Left Col: List & Scout */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden h-full">
          <Card className="p-0 flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
            <div className="p-4 border-b border-black/10 dark:border-white/10 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-10">
              <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider">CRM Pipeline</h3>
            </div>
            <div className="p-2 space-y-2">
              {sponsors.map(sponsor => (
                <div 
                  key={sponsor.id}
                  onClick={() => setSelectedSponsor(sponsor)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedSponsor?.id === sponsor.id
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-white dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-green-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{sponsor.name}</p>
                      <p className={`text-xs ${selectedSponsor?.id === sponsor.id ? 'text-white/80' : 'text-slate-500'}`}>{sponsor.industry}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                      selectedSponsor?.id === sponsor.id ? 'border-white/30 bg-white/20' : 'border-black/10 bg-black/5'
                    }`}>
                      {sponsor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sponsor Scout */}
          <Card className="shrink-0 max-h-[300px] overflow-y-auto custom-scrollbar">
             <h4 className="font-bold mb-2 flex items-center gap-2 text-sm uppercase text-slate-500 tracking-wider"><Search size={14}/> Sponsor Scout</h4>
             <div className="flex gap-2 mb-4">
                <Input 
                   placeholder="Podcast niche (e.g. Tech)..." 
                   value={scoutNiche}
                   onChange={(e) => setScoutNiche(e.target.value)}
                   className="text-xs h-10"
                />
                <Button onClick={handleScoutSponsors} disabled={isGenerating || !scoutNiche} className="px-3" variant="secondary">
                  {isGenerating ? <Sparkles size={16} className="animate-spin"/> : <Sparkles size={16}/>}
                </Button>
             </div>
             <div className="space-y-2">
                {sponsorIdeas.map((idea, i) => (
                   <div key={i} className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-xs flex justify-between items-center">
                      <div>
                         <p className="font-bold text-slate-900 dark:text-white">{idea.name}</p>
                         <p className="text-slate-500">{idea.industry}</p>
                      </div>
                      <button onClick={() => addIdeaToCRM(idea)} className="text-accent hover:bg-accent hover:text-white p-1 rounded transition-colors"><Plus size={14}/></button>
                   </div>
                ))}
                {sponsorIdeas.length === 0 && !isGenerating && (
                   <p className="text-xs text-center text-slate-400 py-2">Use AI to find sponsors.</p>
                )}
             </div>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 overflow-y-auto custom-scrollbar pb-10">
          {selectedSponsor ? (
             <div className="space-y-6 animate-fadeIn">
               <Card>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{selectedSponsor.name}</h3>
                    <select 
                      value={selectedSponsor.status}
                      onChange={(e) => updateSponsor(selectedSponsor.id, { status: e.target.value as any })}
                      className="bg-black/5 dark:bg-white/10 border border-transparent rounded-lg px-3 py-1 text-sm font-bold"
                    >
                      <option>Prospect</option>
                      <option>Contacted</option>
                      <option>Signed</option>
                      <option>Rejected</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                   <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Industry</label>
                      <Input value={selectedSponsor.industry} onChange={(e: any) => updateSponsor(selectedSponsor.id, { industry: e.target.value })} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Contact</label>
                      <Input value={selectedSponsor.contactEmail || ''} placeholder="email@company.com" onChange={(e: any) => updateSponsor(selectedSponsor.id, { contactEmail: e.target.value })} />
                   </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Internal Notes</label>
                    <textarea 
                       className="w-full h-20 bg-black/5 dark:bg-black/20 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-accent border border-transparent"
                       value={selectedSponsor.notes}
                       onChange={(e) => updateSponsor(selectedSponsor.id, { notes: e.target.value })}
                    />
                 </div>
               </Card>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Pitch Generator */}
                 <Card>
                    <h4 className="font-bold mb-4 flex items-center gap-2"><Send size={16} className="text-accent"/> Pitch Drafter</h4>
                    <Button variant="secondary" className="w-full mb-4" onClick={handleDraftEmail} disabled={isGenerating}>
                       {isGenerating ? 'Drafting...' : 'Generate Email'}
                    </Button>
                    <textarea 
                       className="w-full h-48 bg-white dark:bg-white/5 rounded-lg p-3 text-sm focus:outline-none border border-black/5 dark:border-white/5 leading-relaxed"
                       value={draftEmail}
                       readOnly
                       placeholder="AI generated pitch will appear here..."
                    />
                 </Card>

                 {/* Ad Read Generator */}
                 <Card>
                    <h4 className="font-bold mb-4 flex items-center gap-2"><Mic size={16} className="text-accent"/> Ad Read Generator</h4>
                    <div className="space-y-2 mb-4">
                       <Input placeholder="Episode Theme/Context" value={adContext} onChange={(e: any) => setAdContext(e.target.value)} />
                       <select 
                         value={adTone}
                         onChange={(e) => setAdTone(e.target.value)}
                         className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                       >
                          <option>Funny</option>
                          <option>Serious</option>
                          <option>Casual</option>
                          <option>High Energy</option>
                       </select>
                       <Button className="w-full" onClick={handleGenerateAd} disabled={isGenerating}>
                          {isGenerating ? 'Writing...' : 'Generate Script'}
                       </Button>
                    </div>
                    <div className="h-48 overflow-y-auto bg-white dark:bg-white/5 rounded-lg p-3 text-sm border border-black/5 dark:border-white/5">
                       {adRead ? <p className="whitespace-pre-wrap">{adRead}</p> : <span className="opacity-50 italic">Script output...</span>}
                    </div>
                 </Card>
               </div>
             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <DollarSign size={64} className="mb-4" />
              <p>Select a sponsor to manage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};