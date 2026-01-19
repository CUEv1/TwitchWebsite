import { DashboardData } from "./types";
import { dashboardMock } from "./mock";

const TWITCH_API_BASE = "https://api.twitch.tv/helix";

export type FetchOptions = {
  useMock?: boolean;
};

export const fetchDashboardData = async (
  options: FetchOptions = {}
): Promise<DashboardData> => {
  if (options.useMock) {
    return dashboardMock;
  }

  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID as string | undefined;
  const accessToken = import.meta.env.VITE_TWITCH_ACCESS_TOKEN as string | undefined;

  if (!clientId || !accessToken) {
    return dashboardMock;
  }

  const headers = {
    "Client-Id": clientId,
    Authorization: `Bearer ${accessToken}`
  };

  const [streamsResponse, usersResponse] = await Promise.all([
    fetch(`${TWITCH_API_BASE}/streams?first=20`, { headers }),
    fetch(`${TWITCH_API_BASE}/users`, { headers })
  ]);

  if (!streamsResponse.ok || !usersResponse.ok) {
    return dashboardMock;
  }

  const streamsData = await streamsResponse.json();

  return {
    ...dashboardMock,
    overview: dashboardMock.overview.map((item, index) => ({
      ...item,
      value:
        index === 0
          ? `${streamsData.data?.length ?? 0} live now`
          : item.value
    }))
  };
};
