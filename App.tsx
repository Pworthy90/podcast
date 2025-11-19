import React, { useState, useEffect } from 'react';
import { 
  Layout, Mic, Users, DollarSign, BarChart2, Link as LinkIcon, 
  Sparkles, Calendar, ChevronRight, Radio, Scissors, MessageCircle, UserPlus, Sun, Moon, Menu, X, Mail
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { ViewState, Season, Episode } from './types';
import { Button, Card } from './components/Shared';
import { Studio } from './components/Studio';
import { PostProd } from './components/PostProd';
import { Community } from './components/Community';
import { Analytics } from './components/Analytics';
import { IdeaLab } from './components/IdeaLab';
import { SeasonPlanner } from './components/SeasonPlanner';
import { Guests } from './components/Guests';
import { Sponsorships } from './components/Sponsorships';
import { Connections } from './components/Connections';
import { MOCK_SEASONS, ANALYTICS_DATA, MOCK_PRAYER_REQUESTS } from './mockData';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [seasons, setSeasons] = useState<Season[]>(MOCK_SEASONS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Global State shared between Dashboard/Planner/Studio
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  // Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close mobile menu when view changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [view]);

  // --- Render Sidebar ---
  const renderSidebar = () => (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav className={`
        w-64 h-screen bg-white/95 dark:bg-slate-900/95 border-r border-black/10 dark:border-white/10 
        flex flex-col p-4 fixed left-0 top-0 backdrop-blur-xl z-50 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex items-center justify-between px-2 mb-8 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Mic className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">In the Middle</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">Dashboard v3.0</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {[
            { id: ViewState.DASHBOARD, icon: Layout, label: 'Overview' },
            { id: ViewState.IDEA_LAB, icon: Sparkles, label: 'Idea Lab' },
            { id: ViewState.SEASON_PLANNER, icon: Calendar, label: 'Season Planner' },
            { id: ViewState.GUESTS, icon: UserPlus, label: 'Guest Concierge' },
            { id: ViewState.STUDIO, icon: Radio, label: 'Studio Mode' },
            { id: ViewState.POST_PROD, icon: Scissors, label: 'Post-Production' },
            { id: ViewState.SPONSORSHIPS, icon: DollarSign, label: 'Sponsorships' },
            { id: ViewState.ANALYTICS, icon: BarChart2, label: 'Analytics' },
            { id: ViewState.COMMUNITY, icon: MessageCircle, label: 'Community Hub' },
            { id: ViewState.CONNECTIONS, icon: LinkIcon, label: 'Connections' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                view === item.id 
                  ? 'bg-accent text-white shadow-md scale-[1.02]' 
                  : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-black/5 dark:border-white/5 mt-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-slate-500 dark:text-gray-400">Appearance</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 transition-all hover:rotate-12"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>
    </>
  );

  // --- Main Render ---
  return (
    <div className="flex min-h-screen font-sans selection:bg-accent/30 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500" style={{
        backgroundImage: `radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%)`,
        backgroundColor: '#0f172a'
      }} />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-500" style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'
      }} />

      {renderSidebar()}
      
      <main className="flex-1 md:pl-64 p-4 md:p-8 relative z-1 h-screen overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Mic className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg">In the Middle</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-500">
            <Menu size={24} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto w-full h-full animate-fadeIn flex flex-col">
          
          {/* Views */}
          {view === ViewState.DASHBOARD && (
             <div className="space-y-6 md:space-y-8 h-full overflow-y-auto custom-scrollbar pb-20">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-violet-100 to-transparent dark:from-violet-900/50 dark:to-transparent border-violet-500/20">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-900 dark:text-white">Welcome back!</h3>
                    <p className="text-slate-600 dark:text-gray-300 mb-6">Ready to produce season 2?</p>
                    <div className="flex gap-3">
                       <Button onClick={() => setView(ViewState.SEASON_PLANNER)} icon={ChevronRight}>Go to Planner</Button>
                       <Button variant="secondary" onClick={() => setView(ViewState.COMMUNITY)} icon={MessageCircle}>Check Fan Mail</Button>
                    </div>
                  </Card>
                  <Card>
                    <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setView(ViewState.IDEA_LAB)} icon={Sparkles}>New Idea</Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setView(ViewState.STUDIO)} icon={Radio}>Start Recording</Button>
                    </div>
                  </Card>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="col-span-1 lg:col-span-2 h-64 md:h-80">
                    <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Listener Trends</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ANALYTICS_DATA}>
                          <defs>
                            <linearGradient id="colorListensD" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
                          <Area type="monotone" dataKey="listens" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorListensD)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                  
                  <div className="space-y-6">
                    <Card>
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2"><LinkIcon size={16}/> Active Integrations</h3>
                      <div className="flex gap-3 mb-2">
                         <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><span className="text-xs font-bold">Sp</span></div>
                         <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500"><span className="text-xs font-bold">YT</span></div>
                      </div>
                      <p className="text-xs text-slate-500">Syncing properly.</p>
                    </Card>
                    
                    <Card>
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2"><Mail size={16}/> Recent Fan Mail</h3>
                      <div className="space-y-3">
                         {MOCK_PRAYER_REQUESTS.slice(0,2).map(req => (
                            <div key={req.id} className="text-xs border-l-2 border-accent pl-3">
                               <p className="font-bold text-slate-700 dark:text-slate-300">{req.name}</p>
                               <p className="text-slate-500 truncate">{req.request}</p>
                            </div>
                         ))}
                      </div>
                    </Card>
                  </div>
               </div>
             </div>
          )}

          {view === ViewState.IDEA_LAB && <IdeaLab />}
          {view === ViewState.SEASON_PLANNER && (
             <SeasonPlanner 
                seasons={seasons} 
                setSeasons={setSeasons} 
                selectedEpisode={selectedEpisode} 
                setSelectedEpisode={setSelectedEpisode}
                onNavigate={setView}
             />
          )}
          {view === ViewState.STUDIO && (
            <Studio 
              selectedEpisode={selectedEpisode} 
              seasons={seasons} 
              setSelectedEpisode={setSelectedEpisode} 
            />
          )}
          {view === ViewState.POST_PROD && <PostProd />}
          {view === ViewState.COMMUNITY && <Community />}
          {view === ViewState.ANALYTICS && <Analytics />}
          {view === ViewState.GUESTS && <Guests />}
          {view === ViewState.SPONSORSHIPS && <Sponsorships />}
          {view === ViewState.CONNECTIONS && <Connections />}

          {/* Fallback */}
          {!Object.values(ViewState).includes(view) && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
               <h2 className="text-2xl font-bold">Error</h2>
               <p>View not found: {view}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}