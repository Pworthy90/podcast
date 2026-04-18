import React, { useState } from 'react';
import {
  BookOpen, Plus, CheckCircle2, Circle, Sparkles, Loader2,
  PenLine, Trash2, TrendingUp, ChevronRight, BookMarked
} from 'lucide-react';
import { StudyPlan, StudyPassage, StudyNote, JournalEntry, StudyPlanType } from '../types';
import { Button, Card, Input } from './Shared';
import { geminiService } from '../services/geminiService';

type BibleStudyTab = 'PLANS' | 'STUDY' | 'JOURNAL' | 'PROGRESS';
type NoteTab = 'devotional' | 'questions' | 'prayer' | 'verses';
const PLAN_TYPES: StudyPlanType[] = ['Book', 'Topical', 'Custom'];

export const BibleStudy: React.FC = () => {
  const [tab, setTab] = useState<BibleStudyTab>('PLANS');

  // Plans
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newType, setNewType] = useState<StudyPlanType>('Book');
  const [newSessions, setNewSessions] = useState('7');
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Study
  const [studyNotes, setStudyNotes] = useState<StudyNote | null>(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [noteTab, setNoteTab] = useState<NoteTab>('devotional');

  // Journal
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [journalPassage, setJournalPassage] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [writingEntry, setWritingEntry] = useState(false);

  const effectivePlan = activePlan ?? plans[0] ?? null;
  const currentPassage = effectivePlan?.passages.find(p => !p.completed) ?? null;

  const handleCreatePlan = async () => {
    if (!newTitle.trim() || !newTopic.trim()) return;
    setGeneratingPlan(true);
    try {
      const result = await geminiService.generateBibleStudyPlan(
        newTopic, newType, parseInt(newSessions) || 7
      );
      if (result) {
        const plan: StudyPlan = {
          id: Date.now().toString(),
          title: newTitle,
          description: result.description || '',
          type: newType,
          passages: (result.passages || []).map((p: { reference: string }, i: number): StudyPassage => ({
            id: `${Date.now()}-${i}`,
            reference: p.reference,
            completed: false,
          })),
          createdAt: new Date().toISOString(),
        };
        setPlans(prev => [...prev, plan]);
        setNewTitle('');
        setNewTopic('');
        setNewSessions('7');
        setCreating(false);
      }
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleDeletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    if (activePlan?.id === id) setActivePlan(null);
    setStudyNotes(null);
  };

  const handleGenerateNotes = async () => {
    if (!currentPassage) return;
    setGeneratingNotes(true);
    setStudyNotes(null);
    try {
      const notes = await geminiService.generateStudyNotes(currentPassage.reference);
      setStudyNotes(notes);
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleMarkComplete = () => {
    if (!effectivePlan || !currentPassage) return;
    const updatedPassages = effectivePlan.passages.map(p =>
      p.id === currentPassage.id ? { ...p, completed: true } : p
    );
    const updated = { ...effectivePlan, passages: updatedPassages };
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (activePlan?.id === updated.id) setActivePlan(updated);
    setStudyNotes(null);
    setNoteTab('devotional');
  };

  const handleSaveJournal = () => {
    if (!journalPassage.trim() || !journalContent.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      passage: journalPassage,
      content: journalContent,
    };
    setJournal(prev => [entry, ...prev]);
    setJournalPassage('');
    setJournalContent('');
    setWritingEntry(false);
  };

  const tabClass = (t: BibleStudyTab) =>
    `px-4 py-2 rounded-lg font-medium text-sm transition-all ${
      tab === t
        ? 'bg-accent text-white shadow-md'
        : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
    }`;

  const noteTabClass = (t: NoteTab) =>
    `px-3 py-1 text-xs rounded-full font-medium transition-all ${
      noteTab === t
        ? 'bg-accent text-white'
        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-gray-400 hover:bg-accent/10'
    }`;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Bible Study Planner</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Plan, study, and journal your way through Scripture</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('PLANS')} className={tabClass('PLANS')}>📋 Plans</button>
        <button onClick={() => setTab('STUDY')} className={tabClass('STUDY')}>📖 Study</button>
        <button onClick={() => setTab('JOURNAL')} className={tabClass('JOURNAL')}>✏️ Journal</button>
        <button onClick={() => setTab('PROGRESS')} className={tabClass('PROGRESS')}>📊 Progress</button>
      </div>

      {/* ──────────── PLANS TAB ──────────── */}
      {tab === 'PLANS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button icon={creating ? undefined : Plus} onClick={() => setCreating(c => !c)}>
              {creating ? 'Cancel' : 'New Plan'}
            </Button>
          </div>

          {creating && (
            <Card className="border border-accent/30">
              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Create Reading Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Plan Title</label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. John Deep Dive, Fruits of the Spirit" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Book / Topic</label>
                  <Input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="e.g. Gospel of John, Faith, Psalms 1-30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Plan Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {PLAN_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setNewType(type)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          newType === type
                            ? 'bg-accent text-white border-accent'
                            : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-accent/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Number of Sessions</label>
                  <Input
                    type="number"
                    value={newSessions}
                    onChange={e => setNewSessions(e.target.value)}
                    placeholder="7"
                    min="1"
                    max="52"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  icon={generatingPlan ? Loader2 : Sparkles}
                  onClick={handleCreatePlan}
                  disabled={generatingPlan || !newTitle.trim() || !newTopic.trim()}
                >
                  {generatingPlan ? 'Generating Plan...' : 'Generate Plan with AI'}
                </Button>
              </div>
            </Card>
          )}

          {plans.length === 0 && !creating && (
            <Card className="text-center py-16">
              <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-gray-400">No plans yet. Create your first Bible study plan!</p>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(plan => {
              const completed = plan.passages.filter(p => p.completed).length;
              const total = plan.passages.length;
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <Card key={plan.id} className="relative group">
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"
                    title="Delete plan"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookMarked size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white pr-6">{plan.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{plan.type}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-3 line-clamp-2">{plan.description}</p>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
                    <span>{completed}/{total} sessions</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-4">
                    <div className="bg-accent h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <Button
                    variant="secondary"
                    icon={ChevronRight}
                    onClick={() => { setActivePlan(plan); setTab('STUDY'); }}
                  >
                    Open Plan
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────── STUDY TAB ──────────── */}
      {tab === 'STUDY' && (
        <div className="space-y-4">
          {/* Plan selector when multiple plans exist */}
          {plans.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setActivePlan(p); setStudyNotes(null); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    effectivePlan?.id === p.id
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:border-accent/30'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {!effectivePlan ? (
            <Card className="text-center py-16">
              <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-gray-400 mb-4">Create a reading plan to begin studying.</p>
              <Button onClick={() => setTab('PLANS')} icon={Plus}>Create a Plan</Button>
            </Card>
          ) : !currentPassage ? (
            <Card className="text-center py-16">
              <CheckCircle2 size={40} className="mx-auto text-green-400 mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Plan Complete!</h3>
              <p className="text-slate-500 dark:text-gray-400">You've finished all sessions in "{effectivePlan.title}". 🎉</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Passage List */}
              <Card className="lg:col-span-1">
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-3">
                  {effectivePlan.title}
                </h4>
                <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
                  {effectivePlan.passages.map(passage => {
                    const isActive = passage.id === currentPassage.id;
                    return (
                      <div
                        key={passage.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          isActive
                            ? 'bg-accent/10 text-accent font-medium'
                            : passage.completed
                            ? 'text-slate-400 dark:text-gray-600 line-through'
                            : 'text-slate-600 dark:text-gray-400'
                        }`}
                      >
                        {passage.completed
                          ? <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
                          : <Circle size={15} className="flex-shrink-0 opacity-50" />
                        }
                        <span>{passage.reference}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Study Area */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border border-accent/20">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-gray-500 uppercase tracking-wider">Today's Passage</p>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentPassage.reference}</h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!studyNotes && !generatingNotes && (
                        <Button icon={Sparkles} onClick={handleGenerateNotes}>
                          Generate Study Notes
                        </Button>
                      )}
                      {studyNotes && (
                        <Button icon={CheckCircle2} onClick={handleMarkComplete}>
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>

                  {generatingNotes && (
                    <div className="flex items-center justify-center gap-3 text-accent py-12">
                      <Loader2 size={22} className="animate-spin" />
                      <span className="text-sm">Generating study notes with AI...</span>
                    </div>
                  )}

                  {studyNotes && !generatingNotes && (
                    <div>
                      {/* Theme Banner */}
                      <div className="mb-4 p-3 bg-accent/5 rounded-xl border border-accent/10">
                        <p className="text-xs font-semibold text-accent uppercase tracking-wider">Theme</p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">{studyNotes.theme}</p>
                      </div>

                      {/* Note Sub-Tabs */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <button onClick={() => setNoteTab('devotional')} className={noteTabClass('devotional')}>Devotional</button>
                        <button onClick={() => setNoteTab('questions')} className={noteTabClass('questions')}>Discussion</button>
                        <button onClick={() => setNoteTab('prayer')} className={noteTabClass('prayer')}>Prayer</button>
                        <button onClick={() => setNoteTab('verses')} className={noteTabClass('verses')}>Key Verses</button>
                      </div>

                      {noteTab === 'devotional' && (
                        <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                          {studyNotes.devotional}
                        </p>
                      )}

                      {noteTab === 'questions' && (
                        <ul className="space-y-3">
                          {studyNotes.discussionQuestions.map((q, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-slate-700 dark:text-gray-300 text-sm">{q}</p>
                            </li>
                          ))}
                        </ul>
                      )}

                      {noteTab === 'prayer' && (
                        <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                          <p className="text-slate-700 dark:text-gray-300 text-sm italic leading-relaxed">
                            {studyNotes.prayer}
                          </p>
                        </div>
                      )}

                      {noteTab === 'verses' && (
                        <div className="space-y-2">
                          {studyNotes.keyVerses.map((v, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                              <BookOpen size={14} className="text-accent flex-shrink-0" />
                              <span className="text-sm text-slate-700 dark:text-gray-300">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex gap-3 flex-wrap">
                        <Button icon={CheckCircle2} onClick={handleMarkComplete}>
                          Mark Complete & Continue
                        </Button>
                        <Button
                          variant="secondary"
                          icon={PenLine}
                          onClick={() => {
                            setJournalPassage(currentPassage.reference);
                            setTab('JOURNAL');
                            setWritingEntry(true);
                          }}
                        >
                          Write in Journal
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────── JOURNAL TAB ──────────── */}
      {tab === 'JOURNAL' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button icon={writingEntry ? undefined : PenLine} onClick={() => setWritingEntry(w => !w)}>
              {writingEntry ? 'Cancel' : 'New Entry'}
            </Button>
          </div>

          {writingEntry && (
            <Card className="border border-accent/30">
              <h3 className="font-bold mb-4 text-slate-900 dark:text-white">New Journal Entry</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Passage</label>
                  <Input
                    value={journalPassage}
                    onChange={e => setJournalPassage(e.target.value)}
                    placeholder="e.g. Psalm 23, John 15:1-17"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Reflection</label>
                  <textarea
                    value={journalContent}
                    onChange={e => setJournalContent(e.target.value)}
                    placeholder="What did God speak to you through this passage? What stood out? How will you apply it?"
                    rows={5}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                <Button
                  icon={PenLine}
                  onClick={handleSaveJournal}
                  disabled={!journalPassage.trim() || !journalContent.trim()}
                >
                  Save Entry
                </Button>
              </div>
            </Card>
          )}

          {journal.length === 0 && !writingEntry && (
            <Card className="text-center py-16">
              <PenLine size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-gray-400">No journal entries yet. Start writing your reflections!</p>
            </Card>
          )}

          <div className="space-y-3">
            {journal.map(entry => (
              <Card key={entry.id} className="group relative">
                <button
                  onClick={() => setJournal(prev => prev.filter(e => e.id !== entry.id))}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"
                  title="Delete entry"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PenLine size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{entry.passage}</span>
                      <span className="text-xs text-slate-400 dark:text-gray-500">{entry.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{entry.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ──────────── PROGRESS TAB ──────────── */}
      {tab === 'PROGRESS' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Plans', value: plans.length },
              { label: 'Total Sessions', value: plans.reduce((a, p) => a + p.passages.length, 0) },
              { label: 'Completed', value: plans.reduce((a, p) => a + p.passages.filter(x => x.completed).length, 0) },
              { label: 'Journal Entries', value: journal.length },
            ].map(stat => (
              <Card key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-accent">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>

          {plans.length === 0 ? (
            <Card className="text-center py-16">
              <TrendingUp size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-gray-400">Create a plan to start tracking your progress.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Plan Progress</h3>
              {plans.map(plan => {
                const completed = plan.passages.filter(p => p.completed).length;
                const total = plan.passages.length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <Card key={plan.id}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{plan.title}</h4>
                        <p className="text-xs text-slate-400 dark:text-gray-500">
                          {plan.type} Plan · {completed}/{total} sessions complete
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-accent">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-3">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {/* Passage dot grid */}
                    <div className="flex flex-wrap gap-1">
                      {plan.passages.map(p => (
                        <div
                          key={p.id}
                          title={p.reference}
                          className={`w-3 h-3 rounded-sm transition-colors ${
                            p.completed ? 'bg-accent' : 'bg-slate-200 dark:bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
