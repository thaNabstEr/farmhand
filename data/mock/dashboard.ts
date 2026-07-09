export interface KPIMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  status: 'success' | 'warning' | 'error' | 'info';
  description: string;
}

export interface ProjectData {
  id: string;
  name: string;
  region: string;
  formsCount: number;
  submissionsCount: number;
  status: 'active' | 'completed' | 'draft' | 'archived';
  lastUpdated: string;
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: 'submission' | 'sync' | 'update' | 'registry';
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const mockKPIs: KPIMetric[] = [
  {
    id: 'kpi-1',
    title: 'Active Projects',
    value: '14',
    change: '+12% this month',
    changeType: 'increase',
    icon: 'Folder',
    status: 'success',
    description: 'Ongoing field data collection projects'
  },
  {
    id: 'kpi-2',
    title: 'Total Submissions',
    value: '3,842',
    change: '+24% this week',
    changeType: 'increase',
    icon: 'FileText',
    status: 'success',
    description: 'Submitted field inspection reports'
  },
  {
    id: 'kpi-3',
    title: 'Sync Success Rate',
    value: '99.8%',
    change: '-0.1% vs yesterday',
    changeType: 'decrease',
    icon: 'CheckCircle',
    status: 'success',
    description: 'Percentage of error-free offline syncs'
  },
  {
    id: 'kpi-4',
    title: 'Active Operators',
    value: '42',
    change: '5 new this week',
    changeType: 'increase',
    icon: 'Users',
    status: 'success',
    description: 'Field agents sync\'d in the last 24 hours'
  }
];

export const mockProjects: ProjectData[] = [
  {
    id: 'proj-1',
    name: 'Maize Soil Chemistry & pH Survey',
    region: 'North Sector (A1-A4)',
    formsCount: 4,
    submissionsCount: 312,
    status: 'active',
    lastUpdated: '10 minutes ago'
  },
  {
    id: 'proj-2',
    name: 'Post-Harvest Loss Assessment',
    region: 'Central Valley Silos',
    formsCount: 2,
    submissionsCount: 84,
    status: 'active',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'proj-3',
    name: 'Drip Irrigation Infrastructure Audit',
    region: 'South Ridge Orchards',
    formsCount: 5,
    submissionsCount: 195,
    status: 'completed',
    lastUpdated: 'Yesterday'
  },
  {
    id: 'proj-4',
    name: 'Pest Outbreak Alert & Mapping',
    region: 'East Coast Vineyards',
    formsCount: 3,
    submissionsCount: 42,
    status: 'draft',
    lastUpdated: '3 days ago'
  },
  {
    id: 'proj-5',
    name: 'Organic Certification Registry',
    region: 'West Region Co-ops',
    formsCount: 6,
    submissionsCount: 0,
    status: 'draft',
    lastUpdated: '5 days ago'
  }
];

export const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    user: { name: 'Sarah Jenkins', initials: 'SJ' },
    action: 'submitted soil test for',
    target: 'Plot 4B (Maize Survey)',
    timestamp: '4 mins ago',
    type: 'submission'
  },
  {
    id: 'act-2',
    user: { name: 'David Kojo', initials: 'DK' },
    action: 'synced 18 offline reports from',
    target: 'Central Valley Sector',
    timestamp: '15 mins ago',
    type: 'sync'
  },
  {
    id: 'act-3',
    user: { name: 'Elena Rostova', initials: 'ER' },
    action: 'added new farm entry',
    target: 'Green Valley Organic Co-op',
    timestamp: '1 hour ago',
    type: 'registry'
  },
  {
    id: 'act-4',
    user: { name: 'Marcus Aurelius', initials: 'MA' },
    action: 'updated forms in project',
    target: 'Drip Irrigation Audit',
    timestamp: '3 hours ago',
    type: 'update'
  },
  {
    id: 'act-5',
    user: { name: 'Sarah Jenkins', initials: 'SJ' },
    action: 'synced offline database for',
    target: 'North Sector Farms',
    timestamp: '5 hours ago',
    type: 'sync'
  }
];

export const mockQuickActions: QuickActionItem[] = [
  {
    id: 'qa-1',
    title: 'Create New Project',
    description: 'Set up a new field campaign and deploy forms',
    icon: 'FolderPlus',
    color: 'primary'
  },
  {
    id: 'qa-2',
    title: 'Design New Form',
    description: 'Create form layouts for offline collection',
    icon: 'FilePlus',
    color: 'info'
  },
  {
    id: 'qa-3',
    title: 'Register Farmer / Farm',
    description: 'Add a new record to the master registry database',
    icon: 'UserPlus',
    color: 'success'
  },
  {
    id: 'qa-4',
    title: 'Invite Field Operator',
    description: 'Provision access keys for offline application sync',
    icon: 'UserCheck',
    color: 'warning'
  }
];
