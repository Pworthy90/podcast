
import { Season, Sponsor, Guest, PrayerRequest } from './types';

export const MOCK_SEASONS: Season[] = [
  {
    id: 's1',
    number: 1,
    title: 'The Cost of Discipleship',
    episodes: [
      { id: 'e1', title: 'Counting the Cost', theme: 'Sacrifice', status: 'Published' },
      { id: 'e2', title: 'Daily Cross', theme: 'Discipline', status: 'Published' },
    ]
  }
];

export const MOCK_SPONSORS: Sponsor[] = [
  { id: 'sp1', name: 'FaithBox', industry: 'Subscription', status: 'Contacted', notes: 'Sent initial pitch in Jan.' },
  { id: 'sp2', name: 'Logos Bible', industry: 'Software', status: 'Signed', notes: 'Contract valid thru Q4.' },
];

export const MOCK_GUESTS: Guest[] = [
  { id: 'g1', name: 'Dr. John Smith', role: 'Theologian', bio: 'Professor of NT studies, expert on Pauline epistles.', status: 'Confirmed' },
  { id: 'g2', name: 'Sarah Jones', role: 'Author', bio: 'Wrote "Walking in Grace". Focuses on mental health.', status: 'Invited' }
];

export const MOCK_PRAYER_REQUESTS: PrayerRequest[] = [
  { id: 'pr1', name: 'Listener Sarah', request: 'Pray for my son coming back to faith.', status: 'Received', date: '2024-03-10' },
  { id: 'pr2', name: 'Mike T.', request: 'Job interview next week.', status: 'Praying', date: '2024-03-12' }
];

export const ANALYTICS_DATA = [
  { name: 'Mon', listens: 400, downloads: 240 },
  { name: 'Tue', listens: 300, downloads: 139 },
  { name: 'Wed', listens: 550, downloads: 400 },
  { name: 'Thu', listens: 480, downloads: 290 },
  { name: 'Fri', listens: 690, downloads: 450 },
  { name: 'Sat', listens: 800, downloads: 600 },
  { name: 'Sun', listens: 750, downloads: 580 },
];
