# Nuxion Theme Builder

A step-by-step wizard for planning a [Nuxion](../nuxion-base) theme. It checks
your decisions as you go, shows a live preview, and exports what you need to
start building.

It runs entirely in the browser, with no backend. It opens on **Your briefs**,
which lists every brief saved in this browser with its progress, colours and
when it was last edited, where you can open, duplicate, download or delete one,
or start a new one. Each brief autosaves to `localStorage` under its own key,
and can be downloaded as JSON and added back in any browser.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run generate   # static site in .output/public
```

Needs Node 22.18 or newer.

## What it exports

| Export         | Where it goes                         | What it is                                                                                 |
| -------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| BRIEF.md       | `themes/<name>/BRIEF.md`              | The written plan, in the layout of Nuxion's `THEME_BRIEF.md`                               |
| theme.css      | `themes/<name>/app/theme.css`         | Width, shape, button and type tokens, generated variables, and empty rules to write        |
| Studio content | `themes/<name>/studio-content.ndjson` | Colours, Color Themes, buttons, Site Settings and a Home page, for `sanity dataset import` |
| Commands       | Run from the Nuxion repo root         | The dataset, scaffold, import and check commands for this theme                            |

The Review and export step lists the numbered next steps, tailored to the brief.

## Scope

The wizard covers the template through Art and imagery. Blocks is an optional
step. The demo site isn't planned here, so `BRIEF.md` marks that section as not
planned.

## Help filling it in

**Direction.** On the Concept step the author picks up to three mood words and a
sector. Every idea option is tagged with the same words, so later steps list the
options that suit the concept first, marked with a dot. Claude reads it too.

**Ideas, with no key needed.** Guiding questions, sentence builders, starters, a
"Surprise me" mood line, an idea deck of signature features, a rule library, a
four-question identity composer, six palette presets that pass the contrast
checks, and six type scales that fill every size, line height, tracking and
weight in one go, with common values offered in each cell. On Blocks, each
restyled block offers changes to tick for its type plus a Custom box, and the
navigation, footer and iPhone status-bar fields have starters too. The data
lives in `app/services/inspire/`.

**Claude, optional.** With their own API key, the author can ask Claude to
suggest or improve a field, draft a whole step (Concept, Product, Identity, Art)
or mix a palette. Every request opens with the concept, then everything else
written so far. Nothing reaches the brief without a click, and the last change
can always be undone.

- The key goes straight from the browser to Anthropic, with no server in
  between. It lives in session storage, or local storage if the author ticks
  "Remember on this device", and never in the brief or any export
  (`test/unit/ai/keyIsolation.test.ts`).
- A paid Claude plan and the API are separate products, so a subscription
  can't be used directly. Authors need an API key from
  [platform.claude.com](https://platform.claude.com).
- The model is `claude-opus-5-5`, set once in `app/services/ai/client.ts`, with
  server-side fallback on. Suggestions run at low effort; drafts and palettes at
  medium.
- `client.ts` is the only file that talks to Anthropic. Everything else uses the
  `ClaudeCaller` interface, so tests run without a network.

## How it's organised

```
app/services/brief/     The model, the step registry and everything derived from a brief
app/services/brief/checks/  One file of Readiness rules per step
app/services/export/    One renderer per export, plus the next steps
app/services/preview/   What the live preview draws
app/services/inspire/   Direction, idea data and palette presets
app/services/ai/        Claude prompts, answer shapes and how answers apply; client.ts is the only network code
app/stores/brief.ts     The one owner of state, autosave and undo
app/stores/claude.ts    The Claude key and connection, kept apart from the brief
app/components/         ui/ fields, steps/ one per step, preview/ the live panel, shell/ the frame
scripts/syncNuxion.ts   Reads facts from a Nuxion checkout
data/nuxion.generated.json  The result. Generated, so don't edit it
```

Everything under `services/` except `utils/dom.ts` is pure TypeScript, tested
without Vue or a browser.

## Keeping up with Nuxion

The fonts, shipped block types, Markdown field names and template headings all
come from a Nuxion checkout rather than being copied by hand:

```bash
npm run sync:nuxion -- ../nuxion-base
```

Run it after a Nuxion release. `test/integration/nuxion.test.ts` fails if the
snapshot is out of date, and checks the generated Studio documents against
Nuxion's own schema. It looks for `NUXION_BASE`, or a `nuxion-base` folder beside
this one, and is skipped when there is neither.

## Checks

```bash
npm run check   # lint, format, typecheck and tests
```
