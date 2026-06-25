# Deploying ML² to Netlify (from an iPad, no terminal needed)

This is the entirely browser-based path: every step below happens in Safari
(or any browser), with Netlify building the app on its own servers. You
never need to type a terminal command.

---

## Before you start

- Your code needs to already be on GitHub, with the `src` folder properly
  nested (not flattened) - if you're not sure, open the repo on github.com
  and confirm you see a `src` folder at the top level, not a flat list of
  `.tsx` files.
- `netlify.toml` (included in this project) must be at the repo's root,
  alongside `package.json` - same level, not inside a subfolder.

---

## Step 1 — Set your real values before deploying

A few placeholders need real values. Since there's no terminal step here,
you'll set these directly in Netlify's dashboard (Step 5) rather than in a
local `.env.local` file.

Decide now what you want for:
- **The edit password** (currently `mlsquared` in this project - change it
  if you want something else)
- **The dispatch email** in `src/data/dispatchConfig.ts` - if you haven't
  set this yet, edit that file on GitHub directly (open the file on
  github.com, tap the pencil/edit icon, change the line, commit).

---

## Step 2 — Create a Netlify account

1. Open **netlify.com** in Safari.
2. Tap **Sign up**.
3. Choose **Sign up with GitHub** — this is the easiest option since it
   immediately links your GitHub account, and Netlify will ask permission
   to see your repositories.

---

## Step 3 — Import the project

1. Once logged in, tap **Add new site** → **Import an existing project**.
2. Choose **Deploy with GitHub**.
3. If prompted, authorize Netlify to access your repositories (you can
   limit it to just this one repo if you prefer, under "Only select
   repositories").
4. Find and tap your repository (the `M.L.2` repo, or whichever one has
   the current code).

---

## Step 4 — Confirm the build settings

Netlify should auto-detect these from `netlify.toml`, but double-check the
screen shows:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

If they're blank or wrong, type them in manually — this is the one place a
typo would cause a real problem, so check it carefully before continuing.

---

## Step 5 — Add your environment variables

Before hitting deploy, tap **Add environment variables** (sometimes shown
as **Show advanced**):

Add these two:

| Key | Value |
|---|---|
| `VITE_EDIT_PASSWORD` | the password you decided on in Step 1 |
| `VITE_RECAPTCHA_SITE_KEY` | (optional, leave blank for now if you haven't set up Firebase App Check yet) |

This is the equivalent of what `.env.local` does for local development —
Netlify bakes these into the build when it runs `npm run build` on its end.

---

## Step 6 — Deploy

Tap **Deploy site** (the exact label may say "Deploy [site-name]").

Netlify will:
1. Pull your code from GitHub
2. Run `npm install` and `npm run build` on its own servers
3. Publish the `dist` folder

This takes 1–3 minutes. You'll see a live build log scroll by — if it
fails, the error will be visible right there (the same kind of error we've
fixed together before, like a Babel syntax error — copy the exact text if
you see one).

---

## Step 7 — Get your URL

Once it finishes, Netlify shows a random URL like:

```
https://chimerical-narwhal-481920.netlify.app
```

That's your live app. Tap it to open and test.

### Optional: pick a nicer name

Go to **Site settings** → **Change site name** and choose something like
`ml2-ortho-inventory` — it becomes `ml2-ortho-inventory.netlify.app`.

---

## Step 8 — Verify it works

- Confirm the set list shows **30 sets**
- Test the password gate
- Submit a test flag and confirm it shows up in the Secure Archive
- On your iPad: Safari → Share → **Add to Home Screen** — confirm the ML²
  icon installs and the app opens full-screen

---

## Making changes after this first deploy

This is the part that becomes effortless: **every time you push a change to
GitHub** (whether you edit a file directly on github.com, or push from a
computer later), **Netlify automatically rebuilds and redeploys** — no
manual redeploy step, no command to run. Within a minute or two of any
GitHub push, the live site updates itself.

If you ever change an environment variable (like rotating the password),
go to **Site settings → Environment variables**, update it, then trigger a
new deploy manually with **Deploys → Trigger deploy → Deploy site** (since
env var changes don't automatically trigger a rebuild on their own).

---

## If something goes wrong

- **Build fails:** read the build log Netlify shows — it's the same kind of
  error a local `npm run build` would show. Copy the exact text to debug it.
- **Site loads but shows a blank page:** almost always means the publish
  directory is wrong — double check it says `dist`, not `build` or
  something else.
- **Page refreshes 404:** the `netlify.toml` redirect rule handles this
  automatically; if it's still happening, confirm `netlify.toml` is at the
  repo root and wasn't accidentally placed inside a subfolder.
- **Headers don't seem to be applied:** Netlify needs `netlify.toml` to be
  in the repo Netlify is building from — confirm it's committed and pushed,
  not just sitting locally.
