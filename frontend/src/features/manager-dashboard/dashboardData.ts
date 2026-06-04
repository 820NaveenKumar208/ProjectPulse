export type MetricTone = 'blue' | 'green' | 'amber' | 'red';

export type ProjectHealth = 'On track' | 'Watch' | 'At risk';

export const dashboardMetrics = [
  {
    label: 'Active projects',
    value: '12',
    detail: '3 launched this quarter',
    trend: '+18%',
    tone: 'blue' as MetricTone,
  },
  {
    label: 'Completed projects',
    value: '28',
    detail: '6 delivered this quarter',
    trend: '+24%',
    tone: 'green' as MetricTone,
  },
  {
    label: 'Pending approvals',
    value: '7',
    detail: '2 waiting over 48 hours',
    trend: 'Needs review',
    tone: 'amber' as MetricTone,
  },
  {
    label: 'Upcoming deadlines',
    value: '5',
    detail: 'Next deadline in 2 days',
    trend: 'This week',
    tone: 'red' as MetricTone,
  },
];

export const projectProgress = [
  {
    name: 'Northstar Brand',
    client: 'Northstar Labs',
    progress: 82,
    health: 'On track' as ProjectHealth,
  },
  {
    name: 'Lumio Web App',
    client: 'Lumio Health',
    progress: 68,
    health: 'Watch' as ProjectHealth,
  },
  {
    name: 'Atlas Commerce',
    client: 'Atlas Goods',
    progress: 57,
    health: 'On track' as ProjectHealth,
  },
  {
    name: 'Orchid Launch',
    client: 'Orchid Studio',
    progress: 41,
    health: 'At risk' as ProjectHealth,
  },
  {
    name: 'Harbor Portal',
    client: 'Harbor Finance',
    progress: 34,
    health: 'Watch' as ProjectHealth,
  },
];

export const completionTrend = [
  { month: 'Jan', completed: 3, planned: 2 },
  { month: 'Feb', completed: 4, planned: 4 },
  { month: 'Mar', completed: 5, planned: 4 },
  { month: 'Apr', completed: 4, planned: 5 },
  { month: 'May', completed: 6, planned: 5 },
  { month: 'Jun', completed: 6, planned: 6 },
];

export const approvalQueue = [
  {
    project: 'Northstar Brand',
    milestone: 'Visual identity system',
    client: 'Northstar Labs',
    age: '18h',
    status: 'New',
  },
  {
    project: 'Lumio Web App',
    milestone: 'Patient onboarding flow',
    client: 'Lumio Health',
    age: '2d',
    status: 'Waiting',
  },
  {
    project: 'Atlas Commerce',
    milestone: 'Checkout experience',
    client: 'Atlas Goods',
    age: '3d',
    status: 'Overdue',
  },
];

export const upcomingDeadlines = [
  {
    date: 'Jun 06',
    project: 'Northstar Brand',
    milestone: 'Identity handoff',
    health: 'On track' as ProjectHealth,
  },
  {
    date: 'Jun 08',
    project: 'Orchid Launch',
    milestone: 'Campaign assets',
    health: 'At risk' as ProjectHealth,
  },
  {
    date: 'Jun 10',
    project: 'Lumio Web App',
    milestone: 'Usability review',
    health: 'Watch' as ProjectHealth,
  },
];

export const recentActivity = [
  {
    title: 'Client approved the discovery milestone',
    project: 'Northstar Brand',
    time: '24 minutes ago',
    tone: 'green' as MetricTone,
  },
  {
    title: 'Progress updated from 52% to 57%',
    project: 'Atlas Commerce',
    time: '1 hour ago',
    tone: 'blue' as MetricTone,
  },
  {
    title: 'Changes requested on campaign assets',
    project: 'Orchid Launch',
    time: '3 hours ago',
    tone: 'red' as MetricTone,
  },
  {
    title: 'Weekly report published',
    project: 'Harbor Portal',
    time: 'Yesterday',
    tone: 'amber' as MetricTone,
  },
];
