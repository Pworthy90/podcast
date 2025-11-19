import React, { useState } from 'react';
import { MessageCircle, Heart, CheckCircle, Clock, Send, Sparkles, Archive, User, Mail } from 'lucide-react';
import { Button, Card } from './Shared';
import { PrayerRequest, MailbagItem } from '../types';
import { MOCK_PRAYER_REQUESTS } from '../mockData';
import { geminiService } from '../services/geminiService';

export const Community = () => {
  const [activeTab, setActiveTab] = useState<'PRAYER' | 'MAILBAG'>('PRAYER');
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(MOCK_PRAYER_REQUESTS);
  
  // Mailbag State
  const [mailbagInput, setMailbagInput] = useState('');
  const [mailbagItems, setMailbagItems] = useState<MailbagItem[]>([]);
  const [isSorting, setIsSorting] = useState(false);

  const handleSortMailbag = async () => {
    if (!mailbagInput) return;
    setIsSorting(true);
    const items = await geminiService.sortMailbagQuestions(mailbagInput);
    setMailbagItems(items);
    setIsSorting(false);
  };

  const moveRequest = (id: string, status: 'Received' | 'Praying' | 'Answered') => {
     setPrayerRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
  };

  const renderPrayerColumn = (title: string, status: 'Received' | 'Praying' | 'Answered', icon: any, colorClass: string) => (
    <div className="flex-1 flex flex-col gap-4">
      <div className={`flex items-center gap-2 font-bold uppercase text-xs tracking-wider ${colorClass}`}>
        {icon} {title} <span className="bg-white/10 px-2 rounded-full">{prayerRequests.filter(r => r.status === status).length}</span>
      </div>
      <div className="bg-black/5 dark:bg-black/20 rounded-xl p-2 min-h-[400px]">
        {prayerRequests.filter(r => r.status === status).map(req => (
          <div key={req.id} className="bg-white dark:bg-white/5 p-4 rounded-lg shadow-sm mb-3 border border-black/5 dark:border-white/5 hover:border-accent/50 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{req.name}</span>
              <span className="text-[10px] text-slate-400">{req.date}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">{req.request}</p>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {status !== 'Received' && (
                <button onClick={() => moveRequest(req.id, 'Received')} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white" title="Move to Received"><Archive size={14}/></button>
              )}
              {status !== 'Praying' && (
                <button onClick={() => moveRequest(req.id, 'Praying')} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-blue-400" title="Mark as Praying"><Clock size={14}/></button>
              )}
              {status !== 'Answered' && (
                <button onClick={() => moveRequest(req.id, 'Answered')} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-green-400" title="Mark Answered"><CheckCircle size={14}/></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Community Hub</h2>
           <p className="text-sm text-slate-500">Manage prayer requests and fan mail.</p>
        </div>
        <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('PRAYER')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'PRAYER' ? 'bg-white dark:bg-white/20 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Prayer Wall
          </button>
          <button 
            onClick={() => setActiveTab('MAILBAG')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'MAILBAG' ? 'bg-white dark:bg-white/20 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Fan Mail
          </button>
        </div>
      </div>

      {activeTab === 'PRAYER' ? (
        <div className="grid grid-cols-3 gap-6 h-full overflow-y-auto">
          {renderPrayerColumn('Received', 'Received', <Archive size={16}/>, 'text-slate-500')}
          {renderPrayerColumn('Praying', 'Praying', <Heart size={16}/>, 'text-blue-400')}
          {renderPrayerColumn('Answered', 'Answered', <CheckCircle size={16}/>, 'text-green-400')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
          <div className="flex flex-col h-full gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center"><Mail size={20}/></div>
                  <div>
                     <h4 className="font-bold text-sm">Connect Inbox</h4>
                     <p className="text-xs opacity-70">Sync hello@inthemidpod.com</p>
                  </div>
               </div>
               <Button variant="ghost" className="text-xs bg-white/10">Sync</Button>
            </div>

            <Card className="flex flex-col flex-1">
               <h3 className="font-bold mb-4 flex items-center gap-2"><MessageCircle size={18}/> Raw Messages</h3>
               <textarea 
               className="flex-1 bg-black/5 dark:bg-black/30 rounded-lg p-4 text-sm mb-4 focus:outline-none focus:border-accent border border-transparent resize-none"
               placeholder="Paste emails or comments here to categorize them..."
               value={mailbagInput}
               onChange={(e) => setMailbagInput(e.target.value)}
               />
               <Button onClick={handleSortMailbag} disabled={!mailbagInput || isSorting} className="w-full justify-center" icon={Sparkles}>
               {isSorting ? 'Sorting...' : 'Auto-Categorize with AI'}
               </Button>
            </Card>
          </div>

          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
             {mailbagItems.length === 0 && !isSorting && (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                 <Archive size={48} className="mb-4" />
                 <p>No messages processed yet.</p>
               </div>
             )}
             
             {mailbagItems.map((item, i) => (
               <div key={i} className="bg-white/50 dark:bg-white/5 border border-white/10 rounded-xl p-4 animate-fadeIn">
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <div className="p-1 bg-white/10 rounded-full"><User size={12}/></div>
                     <span className="font-bold text-sm">{item.asker}</span>
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                     item.category === 'Theological' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                     item.category === 'Personal' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                     item.category === 'Troll' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                     'bg-slate-500/10 border-slate-500/20 text-slate-400'
                   }`}>
                     {item.category}
                   </span>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-gray-300 italic">"{item.question}"</p>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};