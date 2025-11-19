
import React, { useState } from 'react';
import { BarChart2, Download, DollarSign, Users, Share2, TrendingUp, Globe, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Button, Card } from './Shared';
import { ANALYTICS_DATA } from '../mockData';
import { geminiService } from '../services/geminiService';
import { MediaKit } from '../types';

export const Analytics = () => {
    // Revenue State
    const [cpm, setCpm] = useState(25); // $25 standard
    const [projectedDownloads, setProjectedDownloads] = useState(1000);
    
    // Media Kit State
    const [mediaKit, setMediaKit] = useState<MediaKit | null>(null);
    const [isGeneratingKit, setIsGeneratingKit] = useState(false);

    const revenue = (cpm * projectedDownloads) / 1000;

    const handleGenerateMediaKit = async () => {
        setIsGeneratingKit(true);
        // In a real app, this stats string would be built dynamically from the ANALYTICS_DATA
        const stats = "4000 monthly downloads, growing 10% MoM. Audience 18-34. Top regions: US, UK, AU.";
        const kit = await geminiService.generateMediaKitCopy(stats, "In the Middle");
        setMediaKit(kit);
        setIsGeneratingKit(false);
    };

    return (
      <div className="space-y-6 h-full overflow-y-auto custom-scrollbar pb-10">
        <div className="flex justify-between items-center">
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics & Business</h2>
        </div>

        {/* Top Row: Charts & Projector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="col-span-2 h-80">
             <h3 className="font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
               <TrendingUp size={18} className="text-accent"/> Listener Growth
             </h3>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANALYTICS_DATA}>
                  <defs>
                    <linearGradient id="colorListensA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="listens" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorListensA)" />
                  <Area type="monotone" dataKey="downloads" stroke="#10b981" fillOpacity={0} strokeDasharray="5 5" />
                </AreaChart>
             </ResponsiveContainer>
          </Card>

          {/* Revenue Projector */}
          <Card className="flex flex-col">
            <h3 className="font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign size={18} className="text-green-400"/> Revenue Projector
            </h3>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                   <span className="text-slate-500 dark:text-gray-400">CPM (Cost Per Mille)</span>
                   <span className="font-bold">${cpm}</span>
                </div>
                <input 
                  type="range" min="15" max="60" step="1" 
                  value={cpm} onChange={(e) => setCpm(parseInt(e.target.value))}
                  className="w-full accent-green-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                   <span className="text-slate-500 dark:text-gray-400">Downloads / Episode</span>
                   <span className="font-bold">{projectedDownloads.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="100" max="50000" step="100" 
                  value={projectedDownloads} onChange={(e) => setProjectedDownloads(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div className="mt-auto pt-6 border-t border-white/10 text-center">
                 <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Projected Earnings</p>
                 <p className="text-4xl font-bold text-green-400">${revenue.toFixed(2)} <span className="text-sm text-slate-500 font-normal">/ ep</span></p>
              </div>
            </div>
          </Card>
        </div>

        {/* Media Kit Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1">
             <Card className="h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-accent/20">
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                   <Globe size={48} className="text-accent mb-4" />
                   <h3 className="text-xl font-bold mb-2">One-Click Media Kit</h3>
                   <p className="text-sm text-slate-400 mb-6">Generate a professional, data-backed one-sheet to send to potential sponsors.</p>
                   <Button onClick={handleGenerateMediaKit} disabled={isGeneratingKit} icon={Sparkles} className="w-full justify-center">
                     {isGeneratingKit ? 'Designing...' : 'Generate Media Kit'}
                   </Button>
                </div>
             </Card>
           </div>

           <div className="lg:col-span-2">
              {mediaKit ? (
                <div className="bg-white dark:bg-white text-slate-900 rounded-xl p-8 shadow-2xl animate-fadeIn max-h-[500px] overflow-y-auto relative">
                   <div className="absolute top-0 right-0 p-4 bg-gradient-to-bl from-gray-100 to-transparent rounded-bl-3xl">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media Kit 2025</p>
                   </div>
                   
                   <h2 className="text-3xl font-black tracking-tight mb-2 text-accent">In the Middle.</h2>
                   <p className="text-xl font-light italic text-slate-500 mb-8">"{mediaKit.pitchOneLiner}"</p>
                   
                   <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                         <h4 className="font-bold uppercase text-xs tracking-wider text-slate-400 mb-2">Host Profile</h4>
                         <p className="text-sm leading-relaxed font-medium">{mediaKit.hostBio}</p>
                      </div>
                      <div>
                         <h4 className="font-bold uppercase text-xs tracking-wider text-slate-400 mb-2">Audience</h4>
                         <p className="text-sm leading-relaxed font-medium">{mediaKit.audienceProfile}</p>
                      </div>
                   </div>

                   <div className="bg-slate-100 rounded-lg p-6 mb-6">
                      <h4 className="font-bold uppercase text-xs tracking-wider text-slate-400 mb-4">By The Numbers</h4>
                      <div className="flex justify-between text-center">
                         <div><p className="text-2xl font-black">4.2k</p><p className="text-xs text-slate-500">Downloads/mo</p></div>
                         <div><p className="text-2xl font-black">85%</p><p className="text-xs text-slate-500">Completion Rate</p></div>
                         <div><p className="text-2xl font-black">Top 5%</p><p className="text-xs text-slate-500">Religion Cat.</p></div>
                      </div>
                   </div>

                   <div>
                     <h4 className="font-bold uppercase text-xs tracking-wider text-slate-400 mb-2">Show Highlights</h4>
                     <div className="flex gap-2 flex-wrap">
                        {mediaKit.showHighlights.map((h, i) => (
                          <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">{h}</span>
                        ))}
                     </div>
                   </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8">
                   <p className="text-slate-500">Generate a kit to view preview.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    );
}