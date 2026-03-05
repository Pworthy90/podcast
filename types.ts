
// Enums
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  IDEA_LAB = 'IDEA_LAB',
  SEASON_PLANNER = 'SEASON_PLANNER',
  STUDIO = 'STUDIO',
  SPONSORSHIPS = 'SPONSORSHIPS',
  ANALYTICS = 'ANALYTICS',
  CONNECTIONS = 'CONNECTIONS',
  COMMUNITY = 'COMMUNITY',
  GUESTS = 'GUESTS',
  POST_PROD = 'POST_PROD',
  BIBLE_STUDY = 'BIBLE_STUDY'
}

export enum IdeaTab {
  TOPICS = 'TOPICS',
  VERSE = 'VERSE',
  GUESTS = 'GUESTS',
  SOCIAL = 'SOCIAL',
  RESEARCH = 'RESEARCH',
  METAPHORS = 'METAPHORS',
  CONTROVERSY = 'CONTROVERSY',
  MERCH = 'MERCH',
  THUMBNAIL = 'THUMBNAIL'
}

// Interfaces
export interface RunSheetItem {
  time: string;
  segment: string;
  notes: string;
}

export interface SocialPack {
  youtube: {
    titles: string[];
    description: string;
  };
  instagram: {
    carouselText: string[];
    caption: string;
  };
  tiktok: {
    script: string;
  };
}

export interface ExegeticalAnalysis {
  originalLanguage: {
    word: string;
    definition: string;
    pronunciation: string;
  }[];
  historicalContext: string;
  crossReferences: {
    verse: string;
    connection: string;
  }[];
}

export interface AdInsertionPoint {
  context: string;
  reason: string;
  suggestedTransition: string;
}

export interface Episode {
  id: string;
  title: string;
  theme: string;
  status: 'Draft' | 'Scripted' | 'Recorded' | 'Published';
  outline?: string;
  runSheet?: RunSheetItem[];
  socialPack?: SocialPack;
  verse?: string;
  theologicalReview?: string;
  newsletter?: string;
  blogPost?: string;
  adSlots?: AdInsertionPoint[];
}

export interface Season {
  id: string;
  number: number;
  title: string;
  episodes: Episode[];
}

export interface Sponsor {
  id: string;
  name: string;
  industry: string;
  status: 'Prospect' | 'Contacted' | 'Signed' | 'Rejected';
  notes: string;
  contactEmail?: string;
}

export interface Guest {
  id: string;
  name: string;
  role: string; // e.g. "Author", "Pastor"
  bio: string;
  status: 'Proposed' | 'Invited' | 'Confirmed' | 'Recorded';
  interviewQuestions?: string[];
  briefingEmail?: string;
}

export interface Clip {
  startTime: string;
  endTime: string;
  quote: string;
  reason: string; // Why it's viral
}

export interface TranscriptAnalysis {
  clips: Clip[];
  tics: Record<string, number>;
  summary: string;
}

export interface ArcPoint {
  episode: number;
  title: string;
  intensity: number; // 1-10
  depth: number; // 1-10
}

export interface AnalyticsData {
  name: string;
  listens: number;
  downloads: number;
}

export interface MediaKit {
  hostBio: string;
  audienceProfile: string;
  showHighlights: string[];
  pitchOneLiner: string;
}

export interface RSSHealth {
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
  seoKeywordsFound: string[];
}

export interface GeneratedContent {
  text: string;
  type: 'text' | 'json' | 'markdown';
}

export interface PrayerRequest {
  id: string;
  name: string;
  request: string;
  status: 'Received' | 'Praying' | 'Answered';
  date: string;
}

export interface MailbagItem {
  question: string;
  asker: string; // or "Anonymous"
  category: 'Theological' | 'Personal' | 'Feedback' | 'Troll';
}

export interface StudioMarker {
  id: string;
  time: number; // seconds
  label: string;
  type: 'good' | 'bad' | 'funny' | 'edit';
}

// Bible Study Planner
export type StudyPlanType = 'Book' | 'Topical' | 'Custom';

export interface StudyPassage {
  id: string;
  reference: string;
  completed: boolean;
  scheduledDate?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  type: StudyPlanType;
  passages: StudyPassage[];
  createdAt: string;
}

export interface StudyNote {
  passage: string;
  theme: string;
  devotional: string;
  discussionQuestions: string[];
  prayer: string;
  keyVerses: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  passage: string;
  content: string;
}
