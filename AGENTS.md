## Cursor Cloud specific instructions

This is a **Wordle Solver** — a purely client-side static web application with zero external dependencies (no npm, no build step, no backend).

### Files

- `index.html` — UI with inline CSS/JS; loads `engine.js` and fetches `five_letter_words_sm` at runtime.
- `engine.js` — Solver engine (vanilla JS classes: `LetterState`, `WordState`, `BoardState`, `RuleSet`, `SolverEngine`).
- `five_letter_words_sm` — Plain-text word list (one word per line, ~5,756 entries).

### Running the app

The app uses `fetch()` to load the word list, so it **must be served over HTTP** (not `file://`). Start any static file server from the repo root:

```
python3 -m http.server 8080 --directory /workspace
```

Then open `http://localhost:8080/index.html` in a browser.

### Lint / Test / Build

There are no linters, automated tests, or build steps configured in this project. The entire application is three static files with no dependencies.
