const STORAGE_KEY = "twitch-dashboard-settings";

const elements = {
  channelForm: document.getElementById("channel-form"),
  channelInput: document.getElementById("channel-input"),
  clearChannels: document.getElementById("clear-channels"),
  refresh: document.getElementById("refresh"),
  status: document.getElementById("status"),
  cards: document.getElementById("channels-list"),
  detail: document.getElementById("channel-detail"),
  summaryTotal: document.getElementById("summary-total"),
  summaryLive: document.getElementById("summary-live"),
  summaryViewers: document.getElementById("summary-viewers"),
  summaryAvg: document.getElementById("summary-avg"),
};

const state = {
  channels: [],
  selectedLogin: null,
  users: [],
  trackerMap: new Map(),
};

function loadSettings() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    state.channels = Array.isArray(parsed.channels) ? parsed.channels : [];
  } catch (error) {
    console.warn("Failed to parse settings", error);
  }
}

function saveSettings() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      channels: state.channels,
    })
  );
}

function setStatus(message, tone = "info") {
  elements.status.textContent = message;
  elements.status.style.color = tone === "error" ? "#ff9b9b" : "#f3c969";
}

function formatDate(isoString) {
  if (!isoString) {
    return "Unknown";
  }
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return "-";
  }
  return Number(value).toLocaleString();
}

function formatHours(minutes) {
  if (minutes === null || minutes === undefined) {
    return "-";
  }
  const hours = Number(minutes) / 60;
  return `${hours.toFixed(1)}h`;
}

function parseChannelInput(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.includes("twitch.tv")) {
    const normalizedUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(normalizedUrl);
      const segments = url.pathname.split("/").filter(Boolean);
      return segments[0]?.toLowerCase() || "";
    } catch (error) {
      return "";
    }
  }

  return trimmed.replace(/^@/, "").toLowerCase();
}

function roleLabel(roles = {}) {
  if (roles.isPartner) {
    return "Partner";
  }
  if (roles.isAffiliate) {
    return "Affiliate";
  }
  return "Standard";
}

function renderEmptyState() {
  elements.cards.innerHTML =
    '<div class="table__row"><span>No channels added yet.</span><span>-</span><span>-</span><span>-</span><span>-</span></div>';
  elements.detail.innerHTML =
    '<div class="detail__empty">Select a channel to see detailed stats.</div>';
  elements.summaryTotal.textContent = "0";
  elements.summaryLive.textContent = "0";
  elements.summaryViewers.textContent = "-";
  elements.summaryAvg.textContent = "-";
}

function renderDetail(user, trackerSummary) {
  if (!user) {
    elements.detail.innerHTML =
      '<div class="detail__empty">Select a channel to see detailed stats.</div>';
    return;
  }

  const stream = user.stream;
  const isLive = Boolean(stream);
  const statusLabel = isLive ? "Live" : "Offline";
  const badgeClass = isLive ? "badge badge--live" : "badge";
  const lastBroadcast = user.lastBroadcast?.startedAt;
  const lastOnline = isLive
    ? `Live since ${formatDate(stream.startedAt)}`
    : lastBroadcast
      ? `Last live ${formatDate(lastBroadcast)}`
      : "No recent streams";
  const gameName =
    stream?.game?.displayName || stream?.game?.name || stream?.game_name || "Offline";
  const viewerCount = stream?.viewerCount ?? stream?.viewer_count ?? null;

  elements.detail.innerHTML = `
    <div class="detail__header">
      <div class="detail__title">
        <img class="detail__avatar" src="${user.logo}" alt="${user.displayName}" />
        <div>
          <strong>${user.displayName}</strong>
          <div class="detail__sub">@${user.login}</div>
        </div>
      </div>
      <span class="${badgeClass}">${statusLabel}</span>
    </div>
    <p>${user.bio || "No channel description provided."}</p>
    <div class="detail__grid">
      <div><span>Status</span><strong>${lastOnline}</strong></div>
      <div><span>Followers</span><strong>${formatNumber(user.followers)}</strong></div>
      <div><span>Chatters</span><strong>${formatNumber(user.chatterCount)}</strong></div>
      <div><span>Account created</span><strong>${formatDate(user.createdAt)}</strong></div>
      <div><span>Broadcaster type</span><strong>${roleLabel(user.roles)}</strong></div>
      <div><span>Current game</span><strong>${gameName}</strong></div>
      <div><span>Viewers</span><strong>${formatNumber(viewerCount)}</strong></div>
      <div><span>30d avg viewers</span><strong>${formatNumber(trackerSummary?.avg_viewers)}</strong></div>
      <div><span>30d max viewers</span><strong>${formatNumber(trackerSummary?.max_viewers)}</strong></div>
      <div><span>30d hours watched</span><strong>${formatNumber(trackerSummary?.hours_watched)}</strong></div>
      <div><span>30d hours streamed</span><strong>${formatHours(trackerSummary?.minutes_streamed)}</strong></div>
      <div><span>30d new followers</span><strong>${formatNumber(trackerSummary?.followers)}</strong></div>
    </div>
    <div class="card__footer">
      <span>Updated ${new Intl.DateTimeFormat("en", {
        timeStyle: "short",
        dateStyle: "medium",
      }).format(new Date())}</span>
      <a href="https://twitch.tv/${user.login}" target="_blank" rel="noreferrer">Open</a>
    </div>
  `;
}

function renderList(users, trackerMap) {
  elements.cards.innerHTML = users
    .map((user) => {
      const stream = user.stream;
      const isLive = Boolean(stream);
      const statusLabel = isLive ? "Live" : "Offline";
      const badgeClass = isLive ? "badge badge--live" : "badge";
      const viewerCount = stream?.viewerCount ?? stream?.viewer_count ?? null;
      const isActive = state.selectedLogin === user.login ? "table__row--active" : "";
      const trackerSummary = trackerMap.get(user.login);

      return `
        <div class="table__row ${isActive}" data-login="${user.login}">
          <div class="table__channel">
            <img class="table__avatar" src="${user.logo}" alt="${user.displayName}" />
            <div>
              <strong>${user.displayName}</strong>
              <div class="table__sub">@${user.login}</div>
            </div>
          </div>
          <span class="${badgeClass}">${statusLabel}</span>
          <strong>${formatNumber(viewerCount)}</strong>
          <strong>${formatNumber(user.followers)}</strong>
          <strong>${formatNumber(trackerSummary?.avg_viewers)}</strong>
        </div>
      `;
    })
    .join("");
}

function updateSummary(users, trackerMap) {
  const total = users.length;
  const liveCount = users.filter((user) => user.stream).length;
  const combinedViewers = users.reduce((sum, user) => {
    const viewers = user.stream?.viewerCount ?? user.stream?.viewer_count ?? 0;
    return sum + viewers;
  }, 0);
  const avgViewersValues = users
    .map((user) => trackerMap.get(user.login)?.avg_viewers)
    .filter((value) => typeof value === "number");
  const avgViewers =
    avgViewersValues.length > 0
      ? avgViewersValues.reduce((sum, value) => sum + value, 0) / avgViewersValues.length
      : null;

  elements.summaryTotal.textContent = formatNumber(total);
  elements.summaryLive.textContent = formatNumber(liveCount);
  elements.summaryViewers.textContent = formatNumber(combinedViewers);
  elements.summaryAvg.textContent = avgViewers ? formatNumber(Math.round(avgViewers)) : "-";
}

async function fetchUser(login) {
  const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${login}`);
  if (!response.ok) {
    throw new Error(`Channel lookup failed (${response.status}).`);
  }
  const payload = await response.json();
  return payload[0] || null;
}

async function fetchTrackerSummary(login) {
  const response = await fetch(`https://twitchtracker.com/api/channels/summary/${login}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function refreshChannels() {
  if (state.channels.length === 0) {
    setStatus("Add at least one channel to start tracking.");
    renderEmptyState();
    return;
  }

  setStatus("Refreshing channel stats...");

  try {
    const userResults = await Promise.all(
      state.channels.map(async (channel) => {
        try {
          return await fetchUser(channel);
        } catch (error) {
          return null;
        }
      })
    );

    const users = userResults.filter(Boolean);

    if (users.length === 0) {
      setStatus("No channels found. Double-check the links you added.", "error");
      renderEmptyState();
      return;
    }

    const trackerResults = await Promise.all(
      users.map(async (user) => {
        try {
          const summary = await fetchTrackerSummary(user.login);
          return [user.login, summary];
        } catch (error) {
          return [user.login, null];
        }
      })
    );

    const trackerMap = new Map(trackerResults);
    state.trackerMap = trackerMap;

    state.users = users;
    if (!state.selectedLogin || !users.find((user) => user.login === state.selectedLogin)) {
      state.selectedLogin = users[0]?.login ?? null;
    }

    updateSummary(users, trackerMap);
    renderList(users, trackerMap);
    const selectedUser = users.find((user) => user.login === state.selectedLogin);
    renderDetail(selectedUser, trackerMap.get(state.selectedLogin));

    const missing = state.channels.filter(
      (channel) => !users.find((user) => user.login === channel)
    );

    if (missing.length > 0) {
      setStatus(`Could not find: ${missing.join(", ")}`, "error");
    } else {
      setStatus("Stats updated.");
    }
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function addChannel(value) {
  const normalized = parseChannelInput(value);
  if (!normalized) {
    return;
  }
  if (!state.channels.includes(normalized)) {
    state.channels.push(normalized);
    saveSettings();
  }
  elements.channelInput.value = "";
  refreshChannels();
}

function removeAllChannels() {
  state.channels = [];
  saveSettings();
  renderEmptyState();
  setStatus("Channel list cleared.");
}

elements.channelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addChannel(elements.channelInput.value);
});

elements.clearChannels.addEventListener("click", () => {
  removeAllChannels();
});

elements.refresh.addEventListener("click", () => {
  refreshChannels();
});

elements.cards.addEventListener("click", (event) => {
  const card = event.target.closest("[data-login]");
  if (!card) {
    return;
  }
  state.selectedLogin = card.dataset.login;
  const selectedUser = state.users.find((user) => user.login === state.selectedLogin);
  renderList(state.users, state.trackerMap);
  renderDetail(selectedUser, state.trackerMap.get(state.selectedLogin));
});

loadSettings();
renderEmptyState();
refreshChannels();
