# Nuxion Theme Builder

A step-by-step wizard for planning a [Nuxion](../nuxion-base) theme. It checks
your decisions as you go, shows a live preview, and exports what you need to
start building.

It runs entirely in the browser. Briefs autosave to `localStorage` and can be
downloaded and reopened as JSON. There is no backend.

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

## How it's organised

```
app/services/brief/     The model, the step registry and everything derived from a brief
app/services/brief/checks/  One file of Readiness rules per step
app/services/export/    One renderer per export, plus the next steps
app/services/preview/   What the live preview draws
app/stores/brief.ts     The one owner of state, and autosave
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
