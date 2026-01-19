export type TrendPoint = {
  label: string;
  value: number;
};

export type StatCard = {
  label: string;
  value: string;
  delta: string;
  helper: string;
};

export type ChannelPerformance = {
  name: string;
  category: string;
  averageViewers: number;
  peakViewers: number;
  followersGained: number;
  liveMinutes: number;
  status: "growing" | "steady" | "declining";
};

export type ActivityItem = {
  time: string;
  title: string;
  detail: string;
  accent: "purple" | "teal" | "amber";
};

export type DashboardData = {
  overview: StatCard[];
  trends: TrendPoint[];
  channels: ChannelPerformance[];
  activity: ActivityItem[];
};
