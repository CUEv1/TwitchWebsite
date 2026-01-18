const STORAGE_KEY = "twitch-dashboard-settings";

const elements = {
  channelForm: document.getElementById("channel-form"),
  channelInput: document.getElementById("channel-input"),
  clearChannels: document.getElementById("clear-channels"),
  refresh: document.getElementById("refresh"),
  status: document.getElementById("status"),
  cards: document.getElementById("channels"),
};

const state = {
  channels: [],
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
    '<div class="card"><p>No channels added yet. Use the form above to add a Twitch link.</p></div>';
}

async function fetchUser(login) {
  const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${login}`);
  if (!response.ok) {
    throw new Error(`Channel lookup failed (${response.status}).`);
  }
  const payload = await response.json();
  return payload[0] || null;
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

    elements.cards.innerHTML = users
      .map((user) => {
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

        return `
          <article class="card">
            <div class="card__header">
              <img class="card__avatar" src="${user.logo}" alt="${user.displayName}" />
              <div class="card__title">
                <strong>${user.displayName}</strong>
                <span>@${user.login}</span>
              </div>
              <span class="${badgeClass}">${statusLabel}</span>
            </div>
            <p>${user.bio || "No channel description provided."}</p>
            <div class="stats">
              <div><span>Status</span><strong>${lastOnline}</strong></div>
              <div><span>Followers</span><strong>${formatNumber(user.followers)}</strong></div>
              <div><span>Chatters</span><strong>${formatNumber(user.chatterCount)}</strong></div>
              <div><span>Account created</span><strong>${formatDate(user.createdAt)}</strong></div>
              <div><span>Broadcaster type</span><strong>${roleLabel(user.roles)}</strong></div>
              <div><span>Current game</span><strong>${gameName}</strong></div>
              <div><span>Viewers</span><strong>${formatNumber(viewerCount)}</strong></div>
            </div>
            <div class="card__footer">
              <span>Updated ${new Intl.DateTimeFormat("en", {
                timeStyle: "short",
                dateStyle: "medium",
              }).format(new Date())}</span>
              <a href="https://twitch.tv/${user.login}" target="_blank" rel="noreferrer">Open</a>
            </div>
          </article>
        `;
      })
      .join("");

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

loadSettings();
renderEmptyState();
refreshChannels();
