import React, { useState } from 'react';
import { UserPlus, Mail, Mic, CheckCircle, Clock, User, Plus, Trash2, MessageSquare } from 'lucide-react';
import { Button, Card, Input } from './Shared';
import { Guest } from '../types';
import { MOCK_GUESTS } from '../mockData';
import { geminiService } from '../services/geminiService';

const STANDARD_QUESTIONS = [
  "What is your testimony? How did you come to faith?",
  "What is a favorite scripture verse that has guided you?",
  "How does your faith influence your daily work?",
  "What is the biggest challenge facing the church today?",
  "How do you practice sabbath or rest?",
  "Who has been a spiritual mentor to you?"
];

export const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>(MOCK_GUESTS);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Inputs for new guest
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestRole, setNewGuestRole] = useState('');
  
  // Manual Question Input
  const [manualQuestion, setManualQuestion] = useState('');

  const handleAddGuest = () => {
    if (!newGuestName) return;
    const newGuest: Guest = {
      id: `g-${Date.now()}`,
      name: newGuestName,
      role: newGuestRole || 'Guest',
      bio: '',
      status: 'Proposed'
    };
    setGuests([...guests, newGuest]);
    setNewGuestName('');
    setNewGuestRole('');
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(guests.map(g => g.id === id ? { ...g, ...updates } : g));
    if (selectedGuest?.id === id) setSelectedGuest({ ...selectedGuest, ...updates });
  };

  const handleGenerateQuestions = async () => {
    if (!selectedGuest) return;
    setIsGenerating(true);
    // Assuming a default topic since it's not linked to an episode in this view yet
    const questions = await geminiService.generateInterviewQuestions(selectedGuest.bio || "Christian author and speaker", "Their latest book/ministry");
    const existing = selectedGuest.interviewQuestions || [];
    updateGuest(selectedGuest.id, { interviewQuestions: [...existing, ...questions] });
    setIsGenerating(false);
  };

  const handleAddManualQuestion = () => {
      if (!selectedGuest || !manualQuestion) return;
      const existing = selectedGuest.interviewQuestions || [];
      updateGuest(selectedGuest.id, { interviewQuestions: [...existing, manualQuestion] });
      setManualQuestion('');
  };

  const addStandardQuestion = (q: string) => {
      if (!selectedGuest) return;
      const existing = selectedGuest.interviewQuestions || [];
      updateGuest(selectedGuest.id, { interviewQuestions: [...existing, q] });
  };
  
  const removeQuestion = (index: number) => {
      if (!selectedGuest || !selectedGuest.interviewQuestions) return;
      const newQuestions = [...selectedGuest.interviewQuestions];
      newQuestions.splice(index, 1);
      updateGuest(selectedGuest.id, { interviewQuestions: newQuestions });
  };

  const handleGenerateBriefing = async () => {
    if (!selectedGuest) return;
    setIsGenerating(true);
    const email = await geminiService.generateGuestBriefing(selectedGuest.name, "Podcast Interview", "Recording via Riverside.fm next Tuesday");
    updateGuest(selectedGuest.id, { briefingEmail: email });
    setIsGenerating(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Guest Concierge</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Left Column: List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <div className="mb-4 space-y-2">
            <Input 
              placeholder="Guest Name" 
              value={newGuestName}
              onChange={(e: any) => setNewGuestName(e.target.value)}
            />
            <div className="flex gap-2">
              <Input 
                placeholder="Role (e.g. Author)" 
                value={newGuestRole}
                onChange={(e: any) => setNewGuestRole(e.target.value)}
              />
              <Button onClick={handleAddGuest} disabled={!newGuestName} icon={UserPlus}>Add</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {guests.map(guest => (
              <div 
                key={guest.id}
                onClick={() => setSelectedGuest(guest)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedGuest?.id === guest.id
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-accent/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{guest.name}</p>
                    <p className={`text-xs ${selectedGuest?.id === guest.id ? 'text-white/80' : 'text-slate-500'}`}>{guest.role}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${
                    selectedGuest?.id === guest.id ? 'border-white/30 bg-white/20' : 'border-black/10 bg-black/5'
                  }`}>
                    {guest.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 overflow-y-auto custom-scrollbar pb-10">
          {selectedGuest ? (
            <div className="space-y-6 animate-fadeIn">
              <Card>
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center text-3xl">
                       <User />
                     </div>
                     <div>
                       <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedGuest.name}</h3>
                       <p className="text-slate-500 dark:text-gray-400">{selectedGuest.role}</p>
                     </div>
                   </div>
                   <select 
                     value={selectedGuest.status}
                     onChange={(e) => updateGuest(selectedGuest.id, { status: e.target.value as any })}
                     className="bg-black/5 dark:bg-white/10 border border-transparent rounded-lg px-3 py-1 text-sm font-bold"
                   >
                     <option>Proposed</option>
                     <option>Invited</option>
                     <option>Confirmed</option>
                     <option>Recorded</option>
                   </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Bio / Notes</label>
                  <textarea 
                    className="w-full h-24 bg-black/5 dark:bg-black/20 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-accent border border-transparent"
                    value={selectedGuest.bio}
                    onChange={(e) => updateGuest(selectedGuest.id, { bio: e.target.value })}
                    placeholder="Paste guest bio here..."
                  />
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Questions Generator */}
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2"><Mic size={18} className="text-accent"/> Interview Prep</h4>
                    <Button variant="ghost" onClick={handleGenerateQuestions} disabled={isGenerating || !selectedGuest.bio} className="text-xs">
                      {isGenerating ? 'Thinking...' : 'Generate with AI'}
                    </Button>
                  </div>
                  
                  {/* Manual Question Input */}
                  <div className="flex gap-2 mb-4">
                      <Input 
                          placeholder="Write your own question..." 
                          value={manualQuestion}
                          onChange={(e) => setManualQuestion(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddManualQuestion()}
                          className="text-sm py-2 h-10"
                      />
                      <Button onClick={handleAddManualQuestion} disabled={!manualQuestion} icon={Plus} className="px-3 h-10">Add</Button>
                  </div>

                  {/* Quick Prompts */}
                  <div className="mb-4">
                     <p className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1"><MessageSquare size={12}/> Quick Prompts</p>
                     <div className="flex flex-wrap gap-2">
                        {STANDARD_QUESTIONS.map((q, i) => (
                           <button 
                              key={i}
                              onClick={() => addStandardQuestion(q)}
                              className="px-2 py-1 bg-black/5 dark:bg-white/10 hover:bg-accent hover:text-white rounded-lg text-[10px] transition-colors text-left truncate max-w-[200px]"
                              title={q}
                           >
                              {q}
                           </button>
                        ))}
                     </div>
                  </div>
                  
                  {(!selectedGuest.interviewQuestions || selectedGuest.interviewQuestions.length === 0) ? (
                    <div className="text-center py-8 opacity-50 text-sm">
                      <p>Add questions manually or generate them.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {selectedGuest.interviewQuestions.map((q, i) => (
                        <li key={i} className="text-sm p-3 bg-white dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5 flex gap-2 justify-between items-start group">
                          <div className="flex gap-2">
                             <span className="font-bold text-accent mt-0.5">{i+1}.</span> 
                             <span>{q}</span>
                          </div>
                          <button onClick={() => removeQuestion(i)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={14}/>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                {/* Briefing Generator */}
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2"><Mail size={18} className="text-accent"/> Guest Briefing</h4>
                    <Button variant="ghost" onClick={handleGenerateBriefing} disabled={isGenerating} className="text-xs">
                      {isGenerating ? 'Drafting...' : 'Draft Email'}
                    </Button>
                  </div>

                  {!selectedGuest.briefingEmail ? (
                    <div className="text-center py-8 opacity-50 text-sm">
                      <p>Generate a prep email to send to {selectedGuest.name.split(' ')[0]}.</p>
                    </div>
                  ) : (
                    <textarea 
                      className="w-full h-64 bg-white dark:bg-white/5 rounded-lg p-3 text-sm focus:outline-none border border-black/5 dark:border-white/5 leading-relaxed"
                      value={selectedGuest.briefingEmail}
                      readOnly
                    />
                  )}
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <User size={64} className="mb-4" />
              <p>Select a guest to manage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};