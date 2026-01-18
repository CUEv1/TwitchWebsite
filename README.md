# TwitchWebsite

A lightweight Twitch live dashboard that tracks the channels you care about. Add Twitch URLs or
usernames and get live status, last online time, and channel stats.

## How it works

1. Open `index.html` in your browser.
2. Paste Twitch links (or usernames) in the dashboard and click **Add channel**.
3. Click **Refresh** to pull the latest stats.
4. Select a channel row to view detailed stats in the sidebar.

> The app stores your channel list locally in your browser so you do not have to re-enter them each
> time.

## Data source

This dashboard reads live data from the community Twitch API at <https://api.ivr.fi> and 30-day
summary stats from <https://twitchtracker.com/api>. It does not require your own Twitch Client ID or
access token.
