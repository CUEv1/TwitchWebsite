import { DashboardData } from "./types";

export const dashboardMock: DashboardData = {
  overview: [
    {
      label: "Average Concurrent Viewers",
      value: "48.2K",
      delta: "+6.4%",
      helper: "Last 30 days"
    },
    {
      label: "Hours Watched",
      value: "1.26M",
      delta: "+12.1%",
      helper: "Across top 25 channels"
    },
    {
      label: "New Followers",
      value: "92.3K",
      delta: "+3.8%",
      helper: "Driven by collabs"
    },
    {
      label: "Average Stream Duration",
      value: "4h 18m",
      delta: "-1.2%",
      helper: "Week over week"
    }
  ],
  trends: [
    { label: "Mon", value: 62 },
    { label: "Tue", value: 70 },
    { label: "Wed", value: 66 },
    { label: "Thu", value: 78 },
    { label: "Fri", value: 86 },
    { label: "Sat", value: 92 },
    { label: "Sun", value: 74 }
  ],
  channels: [
    {
      name: "LunaSpectra",
      category: "Just Chatting",
      averageViewers: 8240,
      peakViewers: 15230,
      followersGained: 4230,
      liveMinutes: 980,
      status: "growing"
    },
    {
      name: "PixelForge",
      category: "VALORANT",
      averageViewers: 6120,
      peakViewers: 12840,
      followersGained: 3380,
      liveMinutes: 820,
      status: "steady"
    },
    {
      name: "Waveform",
      category: "Music",
      averageViewers: 4820,
      peakViewers: 10210,
      followersGained: 2750,
      liveMinutes: 640,
      status: "growing"
    },
    {
      name: "RetroRogue",
      category: "Retro",
      averageViewers: 3560,
      peakViewers: 8200,
      followersGained: 1980,
      liveMinutes: 710,
      status: "declining"
    }
  ],
  activity: [
    {
      time: "2h ago",
      title: "Collab spike detected",
      detail: "Co-stream with NovaArc increased average viewers by 14%.",
      accent: "purple"
    },
    {
      time: "5h ago",
      title: "Category shift",
      detail: "VALORANT streams outperformed FPS baseline by 9%.",
      accent: "teal"
    },
    {
      time: "Yesterday",
      title: "Follower milestone",
      detail: "LunaSpectra crossed 1.2M followers.",
      accent: "amber"
    }
  ]
};
