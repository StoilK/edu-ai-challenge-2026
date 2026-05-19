# Development Report — Telegram Learning Bot

A summary of how the Task 3 n8n workflow was built: stack, techniques, what worked, what did not, and notable decisions. The deliverable is the exported workflow in `My Telegram Learning Bot.json`.

---

## Tools & techniques

### Stack

- **Orchestration:** [n8n](https://n8n.io/) (cloud instance), workflow exported as JSON for version control in the repo.
- **Messaging:** Telegram Bot API via **Telegram Trigger** (messages + `callback_query`) and multiple **Telegram** send nodes.
- **Persistence:** **Supabase** — tables `learning_materials` (saved topics) and `user_sessions` (conversation state, quiz payload, answer history).
- **AI:** OpenAI **gpt-5-mini** through n8n **LangChain Agent** nodes (`Teacher Agent`, `Examiner Agent`) with **Structured Output Parser** for JSON-shaped responses.
- **Ingestion:** **HTTP Request** to fetch a URL, then **HTML** node to extract `title` and `article` body before summarization.

### Techniques

- **Dual entry routing.** `If2` splits **callback queries** (inline quiz buttons) from normal **messages**, so answer handling never goes through the command `Switch`.
- **Command normalization.** A **Set** node derives `chatId`, `command` (first token), and `payload` (remainder) from `message.text`.
- **Switch-based command router.** Outputs: `/start`, `/learn`, `/quiz`, and numeric replies (`IsNumber`) for topic selection after `/quiz`.
- **Session state machine in Supabase.** States include `select_topic`, `quiz_active`, and `quiz_finished`; `data` holds a topic `map`, generated `quiz`, `currentQuestion`, `score`, and per-answer audit fields.
- **Two specialized agents.** *Teacher* summarizes scraped HTML into title, bullet summary, concepts, difficulty, and date; *Examiner* generates five MCQs with strict prompts forbidding “metadata” questions about fields/labels.
- **JavaScript Code nodes** for logic that is awkward in pure expressions: building numbered topic lists, resolving map → material ID, formatting questions with inline keyboards, scoring callbacks, and assembling the final recap message.
- **Inline keyboards** for A–D answers; `callback_data` is the letter, matched server-side against `correctAnswer`.
- **Upsert-style session handling.** `Get a row` + `If` chooses **Update** vs **Create** when saving topic-selection state after `/quiz`.

---

## What worked

- **End-to-end flow without custom backend code.** Learn → store → list topics → generate quiz → answer via buttons → score summary is entirely n8n + Supabase + Telegram.
- **Structured Output Parsers.** Forcing JSON schemas for the Teacher and Examiner outputs reduced parse failures compared to free-form LLM replies.
- **Explicit Examiner prompt guardrails.** Long “bad vs good question” examples in the Examiner prompt improved quiz quality when the model had been asking about document structure instead of the subject (e.g. React hooks).
- **Supabase as session store.** Persisting `quiz`, `currentQuestion`, and `answers` across steps made multi-question flows reliable across separate webhook executions.
- **User feedback during slow steps.** “We are preparing the quiz…” before the Examiner run sets expectations while the model generates five questions.
- **Final recap formatting.** `Code in JavaScript4` strips Telegram/n8n boilerplate and option lines from stored question text so the completion message stays readable.
- **Numeric topic selection.** Building a `map` from list index → material `id` keeps the Telegram UX simple (“reply with a number”) without exposing internal IDs.

---

## What did not work (or was painful)

- **Inconsistent `user_id` keys.** New rows in `learning_materials` use `message.chat.id`, while most reads/filters and `user_sessions` use `message.from.id`. In private chats these often coincide, but the mismatch is fragile and can make saved materials invisible to `/quiz` in some chat types.
- **Callback session lookup.** `Get a row1` filters `user_sessions` by `chatId` from the callback, while other branches key on `from.id` — another place where private-chat coincidence masks a latent bug.
- **Published date from scraped pages.** Sites like [react.dev](https://react.dev/reference/react/hooks) do not expose a reliable “published” date in HTML. The HTML node defines `addedDate` without a selector, so it is usually empty; the Teacher prompt asks the model to infer a date, which is approximate at best. A GitHub Commits API side-channel was considered during development but not wired into the final workflow.
- **HTML extraction assumptions.** Content is taken with `cssSelector: article`. Pages without an `<article>` wrapper return empty or thin content, which weakens summaries and quizzes.
- **LLM “metadata” questions.** Early quiz generations referenced fields like “summary” or “title” instead of the topic; fixing this required prompt iteration rather than code alone.
- **Telegram message noise.** n8n’s automatic footer and full question text (including A–D lines) were stored in `answers`; required regex cleanup in the recap Code node.
- **Workflow complexity.** Many generically named nodes (`Send a text message1`…`9`, `Code in JavaScript`…`4`) and cross-node references like `$('Fetch all user\'s topics')` make debugging and refactors error-prone in the n8n UI.
- **Copy mismatch.** The empty-URL branch tells users `Example: /link https://...` while the implemented command is `/learn [url]`.

---

## Notable decisions

1. **n8n instead of a custom Node/Python bot.** Faster iteration on branching, credentials, and AI nodes; trade-off is a large visual workflow and expression-heavy maintenance.
2. **Two agents, two parsers.** Teacher and Examiner are separate LangChain agents with distinct schemas rather than one mega-prompt — clearer responsibilities and easier prompt tuning.
3. **Store raw HTML `content`, AI-derived summary in DB.** Quizzes read stored summary + concepts + full content so the Examiner is not re-scraping the URL each time.
4. **Reply-with-number for topic pick, inline keyboard for answers.** Numbers reuse the message `Switch`; quiz answers need `callback_query` and a parallel branch — simpler than forcing everything through buttons.
5. **Session `data` as a JSON blob.** One Supabase row per user holds map, quiz, progress, and history instead of normalized quiz-answer tables — adequate for a challenge scope, harder to query analytically.
6. **Material IDs like `LM-{{$now.toMillis()}}`.** Client-generated IDs avoid an extra DB round-trip for sequences.
7. **Continue on error for topic fetch.** `Fetch topic data by ID` uses `onError: continueRegularOutput` plus `Verify topic existance` so invalid numeric picks get a friendly Telegram error instead of a hard workflow failure.
8. **gpt-5-mini via AI Gateway.** Credentials are gateway-managed in the export (`__aiGatewayManaged`), keeping API keys out of the JSON artifact.

---

## Bot commands (reference)

| Command | Behavior |
|--------|----------|
| `/start` | Welcome text and command overview |
| `/learn [url]` | Fetch URL → summarize → save to `learning_materials` → send formatted summary |
| `/quiz` | List saved topics; user replies with a number to start a generated quiz |
| *(inline A–D)* | Score answer, update session, send next question or final recap |

---

## Artifact

- **Workflow export:** `My Telegram Learning Bot.json` — import into n8n to run; configure Telegram, Supabase, and OpenAI credentials locally (not included in the repo).
- **Deployed bot:** [@mamnik_bot](https://t.me/mamnik_bot)
