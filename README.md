# OSINT Engagement Log

A static GitHub Pages form for logging persona interactions and prompt injection attempts during OSINT investigations. Submissions are written directly to `data/engagements.csv` in this repository via the GitHub Contents API.

---

## Setup

### 1. Fork or create this repository

Create a new repository on GitHub (can be private) and push this code to it.

### 2. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Set **Source** to `Deploy from a branch`
3. Set **Branch** to `main` / `root`
4. Save — your form will be live at `https://<username>.github.io/<repo>/`

### 3. Create a Personal Access Token

1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. Click **Generate new token (fine-grained)**
3. Set **Repository access** to this repository only
4. Under **Permissions → Repository permissions**, set **Contents** to **Read and Write**
5. Generate and copy the token

### 4. Configure the form

1. Open the hosted form in your browser
2. Click **⚙ GitHub Config** (top right)
3. Enter your GitHub username, repository name, branch (`main`), and the token
4. Click **Save & Verify** — the status bar will turn green when connected

---

## Usage

- Fill in the engagement details and submit — the row is appended to `data/engagements.csv` as a single git commit
- Use **Download CSV Row** to save a local copy of an entry without committing
- Entries are also saved to browser `localStorage` as a fallback
- The `prompts_json` column stores all prompt attempts as a JSON array: `[{"text":"...","result":"successful|unsuccessful"}, ...]`

---

## CSV Schema

| Column | Description |
|---|---|
| `submitted_at` | ISO 8601 timestamp when the form was submitted |
| `engagement_datetime` | Operator-entered date/time of the engagement |
| `operator` | Analyst initials or callsign |
| `reddit_handle` | Target Reddit handle |
| `telegram_handle` | Target Telegram handle |
| `onlyfans_handle` | Target OnlyFans handle |
| `persona_info` | Telegram persona information extracted |
| `injection_techniques` | Summary of injection techniques used |
| `prompts_json` | JSON array of `{text, result}` objects for each override prompt attempt |

---

## Security Notes

- Keep the repository **private** if entries contain sensitive operational data
- The PAT is stored in browser `localStorage` — use a dedicated browser profile for operational work
- Rotate the PAT after an engagement concludes
- The token needs only `Contents: Read & Write` — do not grant broader permissions
