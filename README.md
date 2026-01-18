# TwitchWebsite

A lightweight Twitch live dashboard that tracks the channels you care about. Add Twitch usernames,
connect your Twitch app credentials, and get live status, last online time, and channel stats.

## How it works

1. Create a Twitch developer application: <https://dev.twitch.tv/console/apps>.
2. Generate an **App Access Token**:
   - Use the Twitch CLI (`twitch token -u`) or the OAuth token endpoint.
3. Open `index.html` in your browser.
4. Paste your **Client ID** and **App Access Token** in the dashboard, then add channel names.

> The app stores credentials and channel lists locally in your browser so you do not have to
> re-enter them each time.
