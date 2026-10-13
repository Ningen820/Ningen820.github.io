# Ningen820.github.io — Cybersecurity Portfolio

A dark, responsive cybersecurity portfolio built with Jekyll, Liquid, semantic HTML, CSS, and vanilla JavaScript for GitHub Pages.

## Features

- Profile, experience, skills, projects, writeups, achievements, CVEs, certifications, and contact sections.
- Centralized profile content in `_data/profile.yml`.
- Jekyll `writeups` collection with one permalink per Markdown file.
- Homepage writeups recommended through a reusable Liquid loop, ranked by numeric `reading_time`.
- Search, category/difficulty/platform/OS filters, sorting, and metadata statistics on `/writeups/`.
- JavaScript-generated table of contents, selectable code, and copy buttons on individual writeups.
- Project folders discovered from the public GitHub Contents API; optional release dates are read from README front matter or, for projects tied to another repository, the latest GitHub Release.
- Responsive mobile navigation, subtle matrix background, restrained hover highlights, keyboard focus, and reduced-motion support.

## Deploy to GitHub Pages

1. Copy the contents of this folder into the repository `Ningen820/Ningen820.github.io` (or update `repository` in `_config.yml` and the repo URL in `_data/profile.yml`).
2. In GitHub, open **Settings → Pages** and select the branch and root folder you want to deploy.
3. GitHub Pages will build the Jekyll site. No unsupported Jekyll plugins or build dependencies are required.
4. Once published, test `/`, `/projects/`, `/writeups/`, and each individual writeup URL.

For a local preview, install Ruby, Bundler, and Jekyll, add a `Gemfile` containing `gem "github-pages", group: :jekyll_plugins`, run `bundle install`, then `bundle exec jekyll serve`. The live project discovery needs network access and the repository to be public.

## Edit profile content

Edit `_data/profile.yml` for the name, summary, role, stats, work history, skills, achievements, certifications, education, languages, CV path, and social/contact links. Homepage sections reference this data so a stat or name does not need to be changed in multiple templates.

Set `email` and `linkedin_url` when those details should appear. Do not add credentials, private contact details, API tokens, or sensitive production information to a public repository.

The CV download button points to `assets/ningen820-cv.md`. Replace this starter Markdown CV with verified details (or update `cv_path` to a real PDF) before relying on it for formal applications.

## Add a writeup

Add a Markdown file to `_writeups/`, for example `_writeups/new-topic.md`, with front matter like:

```yaml
---
title: "Writeup title"
summary: "One-sentence description."
category: "DFIR"
difficulty: "Medium"
platform: "Lab or platform"
os: "Linux"
reading_time: 12 # integer minutes, used for recommendation sorting
# image: "/assets/images/writeups/new-topic.png" # optional; displayed above the article
---

## 01 / Overview

Write your verified notes here.
```

The file automatically gets `/writeups/new-topic/`, appears in the archive, contributes to statistics, and can be recommended on the homepage. Use a numeric `reading_time`; use `0` for unknown time. Do not put the same writeup entry in a second index.

### Writeup images

Put image files in `assets/images/writeups/`, then reference them normally from Markdown, for example:

```markdown
![Registry evidence](/assets/images/writeups/baggage-registry.png)
```

Each writeup has its own `image` and `image_alt` front-matter variables. When `image` is non-empty, the shared layout displays it above the article. Markdown image links also display inline.

## Add a project

Create a subfolder in `projects/` and add `README.md` or `readme.md`. Public project cards are discovered from GitHub’s Contents API, so the repository must be public and API requests must not be rate-limited.

Optional README front matter:

```yaml
---
title: "Project title"
description: "A concise project summary."
release_date: "2026-08-15" # fallback when the folder has no external GitHub Release
repository: "owner/separate-project-repo" # optional; latest GitHub Release date is used when available
# draft: true # hide this folder from public project listings while unfinished
---
```

If `repository` is present and the repository has a published GitHub Release, the latest release's `published_at` date takes precedence. Otherwise, a valid `release_date` is used. Projects without a date appear after dated projects, with title used as a stable tie-breaker. No release date is invented.

Homepage recommendations are controlled by `const homeProjectLimit = 2;` in `assets/js/projects.js`. The homepage renders the first N projects from the discovered, sorted list. The homepage writeup count is controlled by `home_writeup_limit` in `index.html`.

## Source and content notes

The supplied reference screenshots include selected profile facts and a partial Baggage evidence overview. The Baggage page only states that supplied scenario and marks missing investigative results instead of inventing a forensic conclusion. The Interpreter page is a scaffold because its source notes were not included. Replace both with the final verified notes before treating those pages as complete publications.

## Accessibility and maintainability

- Semantic landmarks and a skip link.
- Visible keyboard focus, labelled controls, and accessible mobile navigation.
- CSS supports `prefers-reduced-motion`.
- No front-end API tokens, third-party UI dependencies, or build-time plugins.
- Project cards use `textContent` for API-provided text rather than inserting README content as HTML.


### Writeup image sizing and thumbnails

Set each writeup front-matter `image` path to an image in `assets/images/writeups/`. The full image on an article page is displayed without cropping; change `max-height: 360px` in `.writeup-cover img` in `assets/css/site.css` to adjust its maximum displayed height. The same image is also shown as a small thumbnail beside the title in the writeups archive and homepage recommendation cards. Those thumbnail sizes are controlled by `.writeup-row-thumb` and `.writeup-card-thumb` in the same CSS file.


### Project card images

Each project's `readme.md` can include an `image` path relative to that project folder. For example, in `projects/project4/readme.md`, use `image: "image1.png"` when the image is stored at `projects/project4/image1.png`. You can also use `image: "screenshots/overview.png"` for a nested folder. Optional `image_alt` describes the image for accessibility. If the image is missing or fails to load, the card falls back to the `./` symbol.

Use properly separated YAML front matter at the very top of the README, with each field on its own line:

```yaml
---
title: "Project 4 title"
description: "A short project description."
release_date: "2020-09-08"
image: "image1.png"
image_alt: "Project 4 preview"
draft: false
---

# Project 4 title

Project documentation starts here.
```

The release date should use `YYYY-MM-DD`. If a separate GitHub repository is configured in `repository`, its latest published release date takes precedence over this fallback date.


## Dynamic skills, achievements, and certificates

These collections are numbered mappings in `_data/profile.yml`, not fixed lists. Add or remove `skillN`, `achievementN`, or `certificateN` blocks to control exactly how many cards appear. Each block supports `image` and `key`. Use image paths like `/assets/random_images/iconsubst1.png`; put files in `assets/random_images/`. Set `key: "yes"` to give that card a green border, or `key: "no"` for the default border. Skill, achievement, and certificate cards have no hardcoded icon glyphs. Grids display up to three cards per row on desktop.

Example:

```yaml
skills:
  skill1:
    title: "Offensive Security"
    description: "Security testing and vulnerability research."
    image: "/assets/random_images/iconsubst1.png"
    key: "yes"
    items: ["Penetration Testing", "Web Exploitation"]
achievements:
  achievement1:
    title: "HTB RANK 1"
    place: "Rank 1"
    detail: "Hack The Box"
    rank: 1
    image: "/assets/random_images/achievement1.png"
    key: "no"
certifications:
  certificate1:
    name: "Certification name"
    issuer: "Issuer"
    credential: ""
    date: ""
    image: "/assets/random_images/certificate1.png"
    key: "no"
```
