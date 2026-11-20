# Circuit Bench

Interview practice for hardware / EE roles: generated circuit problems with hints, lessons,
flashcards, mock interviews, a circuit simulator, a calculator and a whiteboard. Circuits and
hardware only: coding and firmware practice lives in a separate site (Daily Reps).
Plain HTML, CSS and JavaScript. There is no build step: what is in `public/` is what gets served.

## Layout

    public/
      index.html            page skeleton + the ordered list of <script> tags
      css/styles.css        all styling (light and dark theme)
      js/
        core.js             helpers, number formatting, schematic drawing (Sch), topic list
        topics/*.js         question generators, one file per topic
        topics/interview.js logic, serial protocols, ADC, embedded C, Ethernet + concept question bank
        topics/focus.js     recruiter-focus track: differential, common mode, analog, optics, basic Python (+ lessons)
        lessons.js          Learn tab lessons        lessons-interview.js  lessons for the newer topics
        cheatsheet.js       cheatsheet cards + copy/save/share of schematics
        content.js          extra cheat cards, flashcards, explain-out-loud prompts
        content-focus.js    recruiter-focus cheat cards, flashcards, explain prompts, questions to ask
        sim-dc.js           netlist extraction + DC solver      sim-transient.js  transient analysis
        widgets.js          plots and interactive lesson widgets
        calculator.js  whiteboard.js                            the side tools
        home.js             home (refreshes itself live), interview/mock, cards, search palette, theme
        app.js              storage, practice flow, Ask Claude, learn/cheat/sim screens, router
        sync.js             cross-device sync, offline status, UI scale, init()
        main.js             calls init() (must stay last)
      sw.js                 offline support (reads the file list from index.html)
    functions/api/sync.js   the sync API (Cloudflare Pages Function + D1)
    tests/smoke.js          runs every question generator without a browser
    wrangler.toml           Cloudflare config (project name, D1 binding)
    .github/workflows/deploy.yml   test, then deploy on every push to main

The scripts are ordinary (non-module) scripts that share one global scope, so **order in
`index.html` matters**: a file can use anything defined in a file listed above it.

## Common changes

| I want to...                    | Edit                                                        |
|---------------------------------|-------------------------------------------------------------|
| add / fix a practice question   | `public/js/topics/<topic>.js` (copy an existing `def(...)`) |
| add a concept (multiple choice) | `bank(...)` in `public/js/topics/interview.js`              |
| add a flashcard or explain item | `public/js/content.js`                                      |
| edit a lesson                   | `public/js/lessons.js` or `lessons-interview.js`            |
| change colors / spacing         | `public/css/styles.css`                                     |
| add a new JS file               | create it, add one `<script src>` line to `index.html`      |

## Try it locally

    npx wrangler pages dev          # full site incl. sync, at http://localhost:8788
    node tests/smoke.js             # check the question generators

## Deploy

Push to `main`. GitHub Actions runs the tests and, if they pass, deploys to Cloudflare Pages.
See `DEPLOY.md` for the one-time setup. Deploying by hand still works: `npx wrangler pages deploy`.
