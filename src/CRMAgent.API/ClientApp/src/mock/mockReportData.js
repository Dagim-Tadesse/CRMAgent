// src/mock/mockReportData.js

export const mockChannelLeads = [
  { channel: 'Telegram', count: 42, color: '#3b82f6' },
  { channel: 'LinkedIn', count: 28, color: '#0A66C2' },
  { channel: 'Email', count: 15, color: '#22c55e' },
];

export const mockChannelClassification = [
  { channel: 'Telegram', hot: 18, medium: 15, low: 9, total: 42 },
  { channel: 'LinkedIn', hot: 12, medium: 10, low: 6, total: 28 },
  { channel: 'Email', hot: 4, medium: 6, low: 5, total: 15 },
];

export const mockHotLeadsByChannel = mockChannelClassification.map(c => ({
  channel: c.channel,
  value: c.hot,
  color: c.channel === 'Telegram' ? '#3b82f6' : c.channel === 'LinkedIn' ? '#0A66C2' : '#22c55e'
}));

export const mockFullReport = [
  { 
    channel: 'Telegram', 
    totalLeads: 42, 
    hot: 18, 
    medium: 15, 
    low: 9, 
    avgScore: 6.4, 
    wonDeals: 5,
    conversionRate: '11.9%',
    color: '#3b82f6'
  },
  { 
    channel: 'LinkedIn', 
    totalLeads: 28, 
    hot: 12, 
    medium: 10, 
    low: 6, 
    avgScore: 6.1, 
    wonDeals: 3,
    conversionRate: '10.7%',
    color: '#0A66C2'
  },
  { 
    channel: 'Email', 
    totalLeads: 15, 
    hot: 4, 
    medium: 6, 
    low: 5, 
    avgScore: 4.9, 
    wonDeals: 1,
    conversionRate: '6.7%',
    color: '#22c55e'
  },
];

// Mock lead data for detailed view
export const mockLeadsByChannel = {
  Telegram: [
    { id: 1, name: 'Alice Johnson', score: 9, status: 'Hot', stage: 'ProposalSent', createdAt: '2026-03-01' },
    { id: 2, name: 'Bob Smith', score: 7, status: 'Medium', stage: 'Contacted', createdAt: '2026-03-02' },
    { id: 3, name: 'Carol White', score: 4, status: 'Low', stage: 'New', createdAt: '2026-03-03' },
  ],
  LinkedIn: [
    { id: 4, name: 'David Brown', score: 8, status: 'Hot', stage: 'Qualified', createdAt: '2026-03-01' },
    { id: 5, name: 'Eve Davis', score: 6, status: 'Medium', stage: 'Contacted', createdAt: '2026-03-04' },
  ],
  Email: [
    { id: 6, name: 'Frank Wilson', score: 5, status: 'Medium', stage: 'New', createdAt: '2026-03-05' },
    { id: 7, name: 'Grace Lee', score: 3, status: 'Low', stage: 'New', createdAt: '2026-03-06' },
  ],
};