const STORAGE_KEY = "twitch-dashboard-settings";

const elements = {
  credentialsForm: document.getElementById("credentials-form"),
  clientId: document.getElementById("client-id"),
  accessToken: document.getElementById("access-token"),
  clearCredentials: document.getElementById("clear-credentials"),
  channelForm: document.getElementById("channel-form"),
  channelInput: document.getElementById("channel-input"),
  clearChannels: document.getElementById("clear-channels"),
  refresh: document.getElementById("refresh"),
  status: document.getElementById("status"),
  cards: document.getElementById("channels"),
};

const state = {
  clientId: "",
  accessToken: "",
  channels: [],
};

function loadSettings() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    state.clientId = parsed.clientId || "";
    state.accessToken = parsed.accessToken || "";
    state.channels = Array.isArray(parsed.channels) ? parsed.channels : [];
  } catch (error) {
    console.warn("Failed to parse settings", error);
  }
}

function saveSettings() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      clientId: state.clientId,
      accessToken: state.accessToken,
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

function normalizeChannel(value) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

function render() {
  elements.clientId.value = state.clientId;
  elements.accessToken.value = state.accessToken;

  if (state.channels.length === 0) {
    elements.cards.innerHTML =
      '<div class="card"><p>No channels added yet. Use the form above to add a Twitch username.</p></div>';
    return;
  }
}

async function fetchHelix(path) {
  const response = await fetch(`https://api.twitch.tv/helix/${path}`, {
    headers: {
      "Client-ID": state.clientId,
      Authorization: `Bearer ${state.accessToken}`,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.message || response.statusText;
    throw new Error(`Twitch API error (${response.status}): ${message}`);
  }

  return response.json();
}

async function refreshChannels() {
  if (!state.clientId || !state.accessToken) {
    setStatus("Add your Twitch API credentials to fetch channel stats.", "error");
    return;
  }

  if (state.channels.length === 0) {
    setStatus("Add at least one channel to start tracking.");
    elements.cards.innerHTML =
      '<div class="card"><p>No channels added yet. Use the form above to add a Twitch username.</p></div>';
    return;
  }

  setStatus("Refreshing channel stats...");

  try {
    const logins = state.channels.join("&login=");
    const usersData = await fetchHelix(`users?login=${logins}`);
    const users = usersData.data || [];

    const streamLogins = state.channels.join("&user_login=");
    const streamsData = await fetchHelix(`streams?user_login=${streamLogins}`);
    const streams = streamsData.data || [];

    const streamMap = new Map(streams.map((stream) => [stream.user_id, stream]));

    const videoResults = await Promise.all(
      users.map(async (user) => {
        try {
          const videosData = await fetchHelix(
            `videos?user_id=${user.id}&type=archive&first=1&sort=time`
          );
          return [user.id, videosData.data?.[0] || null];
        } catch (error) {
          return [user.id, null];
        }
      })
    );

    const videoMap = new Map(videoResults);

    elements.cards.innerHTML = users
      .map((user) => {
        const stream = streamMap.get(user.id);
        const lastVideo = videoMap.get(user.id);
        const isLive = Boolean(stream);
        const statusLabel = isLive ? "Live" : "Offline";
        const badgeClass = isLive ? "badge badge--live" : "badge";

        const lastOnline = isLive
          ? `Live since ${formatDate(stream.started_at)}`
          : lastVideo
            ? `Last live ${formatDate(lastVideo.created_at)}`
            : "No recent streams";

        return `
          <article class="card">
            <div class="card__header">
              <img class="card__avatar" src="${user.profile_image_url}" alt="${user.display_name}" />
              <div class="card__title">
                <strong>${user.display_name}</strong>
                <span>@${user.login}</span>
              </div>
              <span class="${badgeClass}">${statusLabel}</span>
            </div>
            <p>${user.description || "No channel description provided."}</p>
            <div class="stats">
              <div><span>Status</span><strong>${lastOnline}</strong></div>
              <div><span>Total views</span><strong>${user.view_count.toLocaleString()}</strong></div>
              <div><span>Account created</span><strong>${formatDate(user.created_at)}</strong></div>
              <div><span>Broadcaster type</span><strong>${user.broadcaster_type || "Standard"}</strong></div>
              <div><span>Language</span><strong>${stream ? stream.language?.toUpperCase() : "N/A"}</strong></div>
              <div><span>Current game</span><strong>${stream ? stream.game_name : "Offline"}</strong></div>
              <div><span>Viewers</span><strong>${stream ? stream.viewer_count.toLocaleString() : "-"}</strong></div>
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
  const normalized = normalizeChannel(value);
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
  render();
  setStatus("Channel list cleared.");
}

function clearCredentials() {
  state.clientId = "";
  state.accessToken = "";
  saveSettings();
  render();
  setStatus("Credentials cleared.");
}

elements.credentialsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.clientId = elements.clientId.value.trim();
  state.accessToken = elements.accessToken.value.trim();
  saveSettings();
  setStatus("Credentials saved. Click refresh to fetch stats.");
});

elements.channelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addChannel(elements.channelInput.value);
});

elements.clearChannels.addEventListener("click", () => {
  removeAllChannels();
});

elements.clearCredentials.addEventListener("click", () => {
  clearCredentials();
});

elements.refresh.addEventListener("click", () => {
  refreshChannels();
});

loadSettings();
render();
refreshChannels();
