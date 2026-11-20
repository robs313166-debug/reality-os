# realityOS

Experimental web-based personal operating system for consciousness tools, goal management, and system refactoring.

A local-only browser prototype. All data stays in your browser via `localStorage`. No server, no network calls.

## Features

- **Goals** — add, edit, complete, reopen, delete
- **Protocols** — if-then procedures with one-click templates, edit, execute + outcome logging, use counts
- **Knowledge library** — expandable principles with reflection prompts
- **System notes** — free-form refactoring / diagnostic notes
- **History** — recent activity + full export / import of JSON state
- **Dashboard** — live counts, simple visualization bar, uptime
- **Global search** — filter goals and protocols live from the header

## Run it

Just open `index.html` in any modern browser (or serve the folder locally if you prefer).

```bash
# optional
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Status

Early prototype (v0.10). Core interaction loop is implemented, including in-place editing of goals and protocols and live search. Added basic #tag support for goals and protocols (parsed from input). Added protocol versioning (prior versions stored on edit) and labeled visualization. Added protocol history viewer (click History on a protocol to see prior versions). Next: richer series or search by tag.

---

Source: this repository. Private counterpart lives in the RealityOS / Aletheon monorepo.
