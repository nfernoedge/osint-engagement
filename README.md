# OSINT Engagement Log

A static GitHub Pages form for logging persona interactions and prompt injection attempts during OSINT investigations. Submissions are written directly to `data/engagements.csv` in this repository via the GitHub Contents API.

---

## How it works

Submitting the form triggers a **GitHub Actions workflow** (`log-engagement.yml`) via the `workflow_dispatch` API. The workflow runs on GitHub's servers, appends the new row to `data/engagements.csv` using the repository's built-in write token, and commits the result. The CSV is updated within ~30 seconds of each submission.

Crucially, the workflow commits to a dedicated **`data` branch**, not `main`. This means GitHub Pages (which deploys from `main`) is never re-triggered by a form submission — the live site stays up and undisturbed.

| Branch | Purpose |
|---|---|
| `main` | Source for GitHub Pages — the form lives here |
| `data` | CSV storage only — created automatically on first submission |

This avoids the PAT `contents: write` permission issues that affect direct browser-to-API file writes.

---

## Setup

### 1. Create a new repository on GitHub

Create a repository (can be private) — do **not** initialise it with a README or any files.

### 2. Push this code

```bash
cd osint-engagement
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Set **Source** to `Deploy from a branch`
3. Set **Branch** to `main` / `root`
4. Save — your form will be live at `https://<username>.github.io/<repo>/`

### 4. Create a Personal Access Token

**Option A — Classic PAT (simplest):**
1. Go to [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Tick the **`repo`** scope
3. Generate and copy the token

**Option B — Fine-grained PAT:**
1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. Click **Generate new token (fine-grained)**
3. Set **Repository access** to this repository only
4. Under **Permissions → Repository permissions**, set **Actions** to **Read and write**
   - `Contents` permission is **not needed** — the workflow uses the built-in `GITHUB_TOKEN`
5. Generate and copy the token

### 5. Configure the form

1. Open the hosted form in your browser
2. Click **⚙ GitHub Config** (top right)
3. Enter your GitHub username, repository name, branch (`main`), and the token
4. Click **Save & Verify** — the status bar will turn green when the workflow file is detected

---

## Usage

- Fill in the engagement details and submit — a GitHub Actions run is triggered and the row is appended to `data/engagements.csv` within ~30 seconds
- Use **Download CSV Row** to save an immediate local copy of any entry
- Entries are also saved to browser `localStorage` as a fallback
- Monitor workflow runs at `https://github.com/YOUR-USERNAME/YOUR-REPO/actions`
- Download the full CSV at any time from the `data` branch:
  `https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-REPO/data/data/engagements.csv`
- The `prompts_json` column stores all prompt attempts as a JSON array: `[{"text":"...","result":"successful|unsuccessful"}, ...]`
- GitHub Pages remains deployed from `main` — form submissions never cause a re-deployment

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
