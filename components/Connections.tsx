import React, { useState } from 'react';
import { Link as LinkIcon, CheckCircle, AlertCircle, Globe, BookOpen, Wifi, Youtube, Instagram, Music, Facebook, Twitter, Video } from 'lucide-react';
import { Button, Card, Input } from './Shared';
import { geminiService } from '../services/geminiService';
import { RSSHealth } from '../types';

export const Connections = () => {
  // Knowledge Base
  const [knowledgeBase, setKnowledgeBase] = useState('');
  
  // RSS Audit
  const [rssUrl, setRssUrl] = useState('');
  const [rssHealth, setRssHealth] = useState<RSSHealth | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAudit = async () => {
    if (!rssUrl) return;
    setIsAuditing(true);
    // Simulating fetching the RSS text. In a real app we would fetch(rssUrl).
    // For the demo, we'll pass the URL or a dummy snippet to the AI service.
    const mockSnippet = `<rss><channel><title>My Podcast</title><description>A great show</description>...</channel></rss>`;
    const result = await geminiService.auditRSSFeed(mockSnippet);
    setRssHealth(result);
    setIsAuditing(false);
  };

  // Mock connection handler
  const [connected, setConnected] = useState<string[]>(['spotify', 'youtube']);
  
  const toggleConnection = (id: string) => {
     if(connected.includes(id)) {
        setConnected(connected.filter(c => c !== id));
     } else {
        setConnected([...connected, id]);
     }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Connections</h2>

      {/* Social Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[
            { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', desc: 'Sync comments & shorts' },
            { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', desc: 'Auto-post captions' },
            { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-black dark:text-white', desc: 'Viral clip distribution' },
            { id: 'spotify', name: 'Spotify', icon: Music, color: 'text-green-500', desc: 'Analytics source' },
            { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', desc: 'Community groups' },
            { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'text-slate-800 dark:text-slate-200', desc: 'News & updates' },
         ].map(app => (
            <Card key={app.id} className={`transition-all duration-300 ${connected.includes(app.id) ? 'border-accent/50 bg-accent/5 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'opacity-80 hover:opacity-100'}`}>
               <div className="flex justify-between items-start mb-4">
                  <app.icon size={32} className={app.color} />
                  <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${connected.includes(app.id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
               </div>
               <h4 className="font-bold text-lg mb-1">{app.name}</h4>
               <p className="text-xs text-slate-500 mb-4">{app.desc}</p>
               <Button 
                  variant={connected.includes(app.id) ? 'secondary' : 'primary'} 
                  className="w-full text-xs"
                  onClick={() => toggleConnection(app.id)}
               >
                  {connected.includes(app.id) ? 'Disconnect' : 'Connect Account'}
               </Button>
            </Card>
         ))}
      </div>

      {/* Knowledge Base Section */}
      <Card>
        <div className="flex items-start gap-4">
           <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <BookOpen size={24} />
           </div>
           <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Theological Knowledge Base</h3>
              <p className="text-sm text-slate-500 mb-4">
                 Paste your core doctrinal statement or values here. 
                 The AI "Theological Review" tool will use this context to check your scripts for alignment with your specific beliefs.
              </p>
              <textarea 
                 className="w-full h-40 bg-black/5 dark:bg-black/30 rounded-lg p-4 text-sm focus:outline-none focus:border-accent border border-transparent"
                 placeholder="e.g. We believe in the Nicene Creed..."
                 value={knowledgeBase}
                 onChange={(e) => setKnowledgeBase(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                 <Button variant="secondary" className="text-xs">Save Context</Button>
              </div>
           </div>
        </div>
      </Card>

      {/* RSS Auditor */}
      <Card>
        <div className="flex items-start gap-4">
           <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
              <Wifi size={24} />
           </div>
           <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">RSS Feed Health</h3>
              <p className="text-sm text-slate-500 mb-4">
                 Check your podcast feed for SEO optimization and technical errors.
              </p>
              <div className="flex gap-4 mb-6">
                 <Input 
                   placeholder="https://feeds.buzzsprout.com/..." 
                   value={rssUrl}
                   onChange={(e: any) => setRssUrl(e.target.value)}
                 />
                 <Button onClick={handleAudit} disabled={isAuditing} icon={Globe}>
                    {isAuditing ? 'Scanning...' : 'Audit Feed'}
                 </Button>
              </div>

              {rssHealth && (
                 <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 p-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-4">
                          <div className={`text-4xl font-black ${rssHealth.score > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                             {rssHealth.score}
                          </div>
                          <div>
                             <p className="font-bold text-sm uppercase text-slate-500">Health Score</p>
                             <p className="text-xs">{rssHealth.score > 80 ? 'Excellent' : 'Needs Improvement'}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <h4 className="font-bold text-red-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><AlertCircle size={14}/> Issues Found</h4>
                          <ul className="space-y-2">
                             {rssHealth.issues.map((issue, i) => (
                                <li key={i} className="text-sm flex gap-2 items-start text-slate-300">
                                   <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                   {issue}
                                </li>
                             ))}
                          </ul>
                       </div>
                       <div>
                          <h4 className="font-bold text-green-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle size={14}/> Suggestions</h4>
                          <ul className="space-y-2">
                             {rssHealth.suggestions.map((sugg, i) => (
                                <li key={i} className="text-sm flex gap-2 items-start text-slate-300">
                                   <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                   {sugg}
                                </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </Card>
    </div>
  );
};