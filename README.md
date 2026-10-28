# Nithyya Bharghava Portfolio

A static GitHub Pages portfolio for Pothagani Nithyya Bharghava. The public site keeps the existing editorial cream, navy, coral, and sage design and renders from the shared model at `content/content.json`.

## Hosts

- Public portfolio: `https://nb355.github.io/` deployed from the `main` branch on GitHub Pages.
- Editor Portal: deploy the same repository as a separate Netlify site and open `/editor/`.

The public portfolio does not depend on Netlify. It remains usable as a static GitHub Pages site even when the editor is not configured.

## Editor Portal

Open `/editor/` on the Netlify site. The portal can edit site identity, SEO metadata, section titles and subtitles, visibility, order, duplication, deletion, structured content blocks, skills, projects, certifications, insights, calculator labels/inputs, and footer content.

Workflow:

1. Load the editor and select a site setting, collection, or section from the content map.
2. Save drafts locally in the browser. The portal also offers draft recovery and reset.
3. Use **Preview** to inspect the same content model in an iframe. Desktop and mobile preview widths are available.
4. Sign in with GitHub as `NB355`.
5. Select **Publish changes**. The server-side Netlify function validates the model and commits `content/content.json` to GitHub. GitHub Pages then rebuilds from `main`.

Content blocks are allow-listed structured blocks: `text`, `list`, `cards`, `skills`, `process`, `projects`, `calculators`, `insights`, `resume`, and `contact`. The renderer escapes text and never executes editor-provided HTML or JavaScript. Calculator formulas are fixed in `app.js`; the portal only changes labels, descriptions, and supported numeric inputs.

## Netlify publishing setup

Create a separate Netlify site from this repository. Do not commit credentials. Add these environment variables in the Netlify site settings:

- `URL`: the Netlify site URL, used as the OAuth callback base.
- `GITHUB_CLIENT_ID`: GitHub OAuth App client ID.
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App client secret.
- `SESSION_SECRET`: long random value used to sign the short-lived HttpOnly session cookie.
- `GITHUB_TOKEN`: server-side GitHub token with permission to update the repository contents. Use a fine-grained token limited to `NB355/NB355.github.io` with Contents read/write permission.
- `GITHUB_REPO`: `NB355/NB355.github.io`
- `GITHUB_BRANCH`: `main` (optional; defaults to `main`)
- `GITHUB_CONTENT_PATH`: `content/content.json` (optional; this is the default)

Create a GitHub OAuth App with callback URL:

`https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/auth-callback`

The callback verifies the GitHub account login exactly equals `NB355`. The browser never receives the GitHub client secret or repository token. Before these variables are configured, sign-in/publishing reports an unavailable state rather than pretending that a local draft is live.

## GitHub Pages setup

In the GitHub repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main`, and choose `/ (root)`. The root `index.html` is the public site entry point. A push to `main` from the Netlify publish function triggers GitHub Pages deployment. GitHub Pages deployment can take a few minutes; the editor reports the commit URL but cannot claim deployment completion until GitHub Pages has finished processing it.

## Content editing notes

- Keep factual claims grounded in the resume and verified project information. Current incomplete work is labeled `In Progress`, `Planned`, or `Draft`.
- Use committed paths such as `./profile.jpg` for images on GitHub Pages. Image upload is intentionally not implemented because GitHub content uploads require an explicit repository permission and asset workflow; add an image to the repository and then set its path in the editor.
- Project and collection JSON must remain valid arrays. Required URLs must use `https://` or `http://`.
- The contact form opens the visitor's email application using the configured email address; it does not send mail from a server.

## Local preview

Because the public site fetches JSON, use a local static server rather than opening `index.html` directly. For example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/` for the public site or `http://localhost:8080/editor/` for the local draft editor. Publishing functions only work when the Netlify deployment and environment variables are configured.
