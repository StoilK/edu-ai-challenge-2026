# Telegram Learning Bot — User Guide

A Telegram bot that turns web articles into study notes and multiple-choice quizzes. The bot runs as an [n8n](https://n8n.io/) workflow (`My Telegram Learning Bot.json`).

**Live bot:** [@mamnik_bot](https://t.me/mamnik_bot) — open in Telegram and tap **Start**.

---

## Setup (one time)

1. **Import the workflow** in n8n: **Workflows → Import from file** → choose `My Telegram Learning Bot.json`.
2. **Connect credentials** in n8n:
   - **Telegram** — Bot token from [@BotFather](https://t.me/BotFather).
   - **Supabase** — Project URL and service/API key; tables `learning_materials` and `user_sessions` must exist.
   - **OpenAI** — API access for the Teacher and Examiner agents (or your n8n AI gateway).
3. **Activate** the workflow so the Telegram webhook stays live.
4. In Telegram, open [@mamnik_bot](https://t.me/mamnik_bot) (or your own instance) and send `/start`.

---

## How to use the bot

### 1. Start

Send:

```
/start
```

You get a short welcome and the list of commands.

### 2. Add learning material

Send a link to an article or docs page:

```
/learn https://react.dev/reference/react/hooks
```

The bot will:

- Fetch and read the page
- Build a summary (title, bullet points, main concepts, difficulty)
- Save it to your library
- Reply with the formatted summary

**Tip:** Use pages with a clear article body. Sites with little HTML structure may produce weaker summaries.

If you send `/learn` without a URL, the bot asks you to include one.

### 3. Start a quiz

Send:

```
/quiz
```

The bot lists your saved topics, numbered:

```
📚 Choose a topic:

1. Built-in React Hooks
2. ...

👉 Reply with a number
```

### 4. Pick a topic

Reply with the number only, for example:

```
1
```

The bot generates five multiple-choice questions (this can take a few seconds). You may see: *“We are preparing the quiz…”*

### 5. Answer questions

Each question appears with **inline buttons A, B, C, D**. Tap one option.

After each answer you get:

- **Correct** — a short confirmation, then the next question
- **Incorrect** — the right answer and a brief explanation, then the next question

### 6. See your results

After the fifth question, the bot sends a **quiz recap**: score (%), and a breakdown of each question (full detail only for questions you missed).

---

## Commands

| Command | What it does |
|--------|----------------|
| `/start` | Welcome and help |
| `/learn [url]` | Summarize a URL and save it |
| `/quiz` | List your topics and start a quiz |
| `1`, `2`, … | Select a topic after `/quiz` (when prompted) |

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Bot does not reply | Check that the n8n workflow is **active** and Telegram credentials are valid. |
| `/quiz` shows no topics | Run `/learn` with a URL first. |
| “Topic does not exist” | Send `/quiz` again and pick a number from the **current** list. |
| Weak or empty summary | Try another URL; pages without an `<article>` (or similar) body extract poorly. |
| Quiz feels off-topic | Re-run `/learn` on a page with more content, then quiz again. |

---

## Files in this folder

| File | Purpose |
|------|---------|
| `My Telegram Learning Bot.json` | n8n workflow export |
| `report.md` | Development notes (tools, decisions, lessons learned) |
| `README.md` | This guide |
