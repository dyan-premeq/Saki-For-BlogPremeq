# design-sync notes — saki-astro

Repo-specific gotchas for future syncs. Read this before re-running.

## What this sync is

**Foundations-only.** This repo is an Astro site, not a React component library:
14 `.astro` files, no JSX/TSX, no library entry in `package.json`, no Storybook.
`.astro` components compile to the Astro server runtime and cannot be bundled
into the React components claude.ai/design renders, so the converter runs in its
**tokens-only** mode (`[ZERO_MATCH] → treating as tokens-only DS`) and
`_ds_bundle.js` is intentionally empty.

Porting the `.astro` components to React was considered and rejected: it would
be a reimplementation, not a sync — new code the site doesn't ship, guaranteed
to drift from the originals. If a real React component library is ever added,
re-point `cfg.entry` at its built dist entry and the same pipeline imports it
with no other changes.

## The CSS pipeline (the fiddly part)

`cfg.cssEntry` points at `.design-sync/.cache/ds.css`, which is **generated** —
`.cache/` is gitignored, so a fresh clone must run `cfg.buildCmd`
(`node .design-sync/build-css.mjs`) before `package-build.mjs`.

- The repo's raw stylesheets **cannot** be uploaded directly. They use Tailwind
  v4 at-rules (`@import "tailwindcss"`, `@plugin`, `@reference`) that only
  resolve inside a Tailwind build; shipped raw they are unparseable standalone.
- **`global.css` and `typography.css` must be compiled SEPARATELY and
  concatenated** — this is the trap. `typography.css` opens with
  `@reference "./global.css"`, and compiling the two together makes Tailwind
  treat global.css as reference-only, silently dropping its `@theme inline`
  variables (`--font-prose-latin`, `--font-display-cjk`, …). The `.font-*` role
  classes still compile, they just point at variables nothing defines, and every
  design renders in a fallback font. Verified against the real site build, which
  ships them as two stylesheets for the same reason. `build-css.mjs` has an
  assertion that fails the build if this regresses — do not remove it.
- Tailwind only emits utilities it finds in scanned content. A design agent
  writes classes that appear nowhere in this repo, so `ds-styles.css` carries a
  block of `@source inline(...)` safelists covering the common utility families.
  Widen it if agent-authored designs come out unstyled.
- Tailwind 4.3 bakes literal fallbacks into utilities
  (`gap: calc(var(--spacing, 0.25rem) * 4)`), so the compiled CSS is
  self-contained even though `@layer theme` is empty. Do not "fix" that.

## Fonts

The site loads fonts through **Astro's Fonts API** (`fonts:` in `astro.config.ts`
+ `<Font cssVariable>` in `SiteLayout.astro`), which generates `@font-face` at
build time and never writes them to a stylesheet. `.design-sync/fonts.css`
transcribes those declarations by hand so the bundle is self-contained, and
`ds-styles.css` defines the matching `--font-*` variables Astro would otherwise
inject at runtime.

**Both files must be kept in sync with `astro.config.ts`.** If a family, weight,
or font file changes there, mirror it in `.design-sync/fonts.css` (the
`@font-face` rule) and in `ds-styles.css`'s `:root` block (the variable value).
Nothing detects drift automatically.

The three Chinese families come from the remote ZeoSeven font service, sliced by
unicode-range so a page only fetches the blocks it uses. `ds-styles.css` mirrors
`SiteLayout.astro`'s three `@import url(...)` lines:

| ZeoSeven id | family | token |
|---|---|---|
| 24 | LXGW Heart Serif | `--font-display-cjk` |
| 292 | LXGW WenKai | `--font-prose-cjk` |
| 802 | YShi-Written (写意体) | `--font-quote-cjk` |

**ZeoSeven returns HTTP 204 with an empty body to `localhost` / `127.0.0.1`
referers.** Verified: `claude.ai` → 200, the production domain → 200,
`127.0.0.1` → 204/0 bytes. So the Chinese faces never render in a locally
served preview. That is a property of the preview, not a defect in the bundle —
do not "fix" it by self-hosting.

Self-hosting was in fact tried and reverted this round: the upstream TTF
(github.com/Steve-Yuu/YShi-Written, SIL OFL) subsets to ~0.83 MB woff2, versus
88 KB actually transferred through ZeoSeven's slicing. Roughly 10x worse for
the same face — only revisit if ZeoSeven becomes unreliable.

## Known warns (expected — a warn NOT listed here is new)

- `[TOKENS_MISSING] --shiki-light-bg, --shiki-light, --shiki-dark-bg,
  --shiki-dark` — Shiki sets these inline on code blocks at render time. This is
  the documented "vars set at runtime are expected to be absent" case.
- `[RENDER_SKIPPED]` — the bundle has zero component preview cards, so the
  headless render check has nothing to open. Validate is run with
  `--no-render-check`. Visual verification is done instead by opening
  `ds-bundle/.foundations.html`, a specimen page (dot-prefixed, never uploads)
  that loads the real `styles.css` and exercises every font role in Latin and
  Chinese, all tokens, the safelisted utilities, and the `.prose` scale.
  Serve it with `node .ds-sync/storybook/http-serve.mjs ./ds-bundle`.
- `[DTS_REACT] @types/react not found` — harmless here; there are no components
  whose props need resolving.
- `cfg.runtimeFontPrefixes` suppresses `[FONT_MISSING]` for the CJK families.
  Strictly the field means "served by a runtime font service", which is exactly
  right for the LXGW/YShi families, and a deliberate stretch for the rest
  (PingFang, Microsoft YaHei, Hiragino, Songti, …) — those are **OS-provided
  fallback faces** in the font stacks that no one ships. Left unsuppressed the
  warning would fire forever and train everyone to ignore a real signal.

## Deliberate exclusions

- `cfg.guidelinesGlob` is `[]`, which drops `docs/content-authoring.md` from the
  upload. It documents the MDX content contract and the `TerminalFrame`
  component — and since no components ship, handing it to the design agent would
  invite it to compose with a component that does not exist. The conventions
  header calls this out explicitly.

## Source changes made by the sync (not sync-only edits)

These touched the site itself, not just the design bundle:

- `--color-link` `#2337ff` → `#9a3412`, `--color-link-strong` `#000d8a` →
  `#7c2d12` (`src/styles/global.css`). Requested: links should read warm to
  match the accent orange rather than clashing blue. `#9a3412` was chosen for
  contrast — 7.04:1 on the paper background, versus 6.60:1 for the old blue and
  only **2.11:1** for `--color-accent` `#fe9600` itself, which fails WCAG AA and
  must not be used for body-text links.
- `--color-link-strong` is currently **declared but never referenced** anywhere
  in `src/`. It was updated to keep the pair coherent; wire it into `a:hover`
  or delete it.
- ZeoSeven **802 (YShi-Written) moved from `ProsePageLayout.astro` into
  `SiteLayout.astro`**. It used to load only on article pages, so CJK
  pull-quotes elsewhere silently fell back to KaiTi. Now site-wide, and the
  now-redundant `proseFontLink` block was removed from `ProsePageLayout`.
- `tsconfig.json` `exclude` gained `ds-bundle`, `.ds-sync`, `.design-sync` —
  without it `astro check` walks the generated bundle and reports hints from
  `_vendor/react.js`.

## Pre-existing issue (NOT caused by the sync)

`pnpm run build` fails at *prerendering static routes* with a bare
`fetch failed` / `internalConnectMultiple`. Confirmed pre-existing by stashing
every sync change and rebuilding on clean `main` — identical failure. Something
in prerendering reaches the network and cannot connect from this machine. The
CSS pipeline here does not depend on `astro build`, so the sync is unaffected,
but the site build is currently broken locally and worth chasing separately.

## Re-sync risks

- **`astro.config.ts` font drift** — the highest-risk item. `fonts.css` and the
  `:root` font variables are hand-transcribed copies. A font swap in
  `astro.config.ts` will not surface anywhere; the bundle just keeps shipping the
  old faces. Diff them on every sync.
- **The two-compile CSS split** is load-bearing and non-obvious. Anyone
  "simplifying" `build-css.mjs` into a single compile silently breaks every font
  role. The assertion in that script is the only guard.
- **The utility safelist is a guess at what a design agent will write.** It is
  not derived from anything; if designs come back unstyled, widen it.
- **Never machine-render-checked.** No headless browser ran against this bundle
  in any sync so far — verification is a human looking at the specimen page.
- **Tailwind version coupling.** `.ds-sync` pins `@tailwindcss/cli` and
  `tailwindcss` to match the repo's version (4.3.0 at time of writing). If the
  repo bumps Tailwind, bump the staged pins together or the compiled output may
  diverge from what the site ships.
- `dist/` in this repo is `astro build` output (a rendered site), **not** a
  component dist. Do not point `cfg.entry` at it.
