# Discord Judge Bot

This is a simple Discord bot that judges gaming-related stuff with random verdicts and funny sentences. Use it in your server for laughs!

## What It Does
- Judges subjects with dramatic verdicts and sentences.
- Allows a **one-time appeal** per subject.
- Keeps a short-term memory of past cases while the bot is running.
- Displays all current cases in a list.

## Commands
- `!judge <subject>`
  Judges the given subject (e.g., `!judge Camping`) and returns:
  - A random verdict (e.g., `BANNED`, `GG WP`)
  - A humorous sentence in an embed

- `!appeal <subject>`
  Appeals a previous judgment:
  - Randomly **GRANTED** or **DENIED**
  - Each subject can only be appealed **once**

- `!cases`
  Lists all judged subjects and shows whether their case is:
  - Open for appeal
  - Final (already appealed)

## How Memory Works
- The bot stores judgments **in memory only** (no database).
- Each subject can only be judged once.
- Each judgment can only be appealed once.
- All memory is **reset when the bot restarts**.

## Setup
1. Clone the repo:
   `git clone https://github.com/gfgago/judge-bot.git`
2. Install dependencies:
   `npm install`
3. Create a `.env` file with:
   `TOKEN=your-discord-bot-token`
4. Run the bot:
   `node index.js`

## Usage
- Invite the bot to your server via the Discord Developer Portal.
- Use commands in any channel the bot can read and write in.

Built for fun with Discord.js. MIT License.
