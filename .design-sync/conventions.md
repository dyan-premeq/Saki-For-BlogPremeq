# saki-astro — foundations

**This design system ships no components.** The blog's UI is authored in `.astro`
files, which cannot be compiled into React, so `_ds_bundle.js` is intentionally
empty and there are no preview cards. What ships is the *foundation*: the type
scale, font stacks, color tokens and prose styling the site actually renders
with. Build screens out of plain HTML elements styled with the vocabulary below
— never import from `window.SakiAstro`, and never assume a component named in
repo docs (e.g. `TerminalFrame`) is available here.

## Setup

No provider and no wrapper component. Load `styles.css` and write markup.

Two things the stylesheet depends on:

- **Content must live inside `<body>`.** The font machinery is declared on
  `body, body :where(*)`; elements outside it get no font stack.
- **Set `lang` on the root or on any element with CJK text.** The stacks are
  language-aware: `:lang(en)` puts the latin face first, `:lang(zh)` puts the
  Chinese face first. Getting this wrong is the single most common way to make
  a design look off-brand.

## Styling idiom

Tailwind v4 utilities for layout and spacing, plus two system-specific layers.

**Font-role classes** — always prefer these over `font-family` or Tailwind font
utilities. Each sets a latin face, a CJK face and a fallback, then composes them
in the right order for the element's language:

| Class | Role | Latin face |
|---|---|---|
| `.font-ui` | interface text, default | Atkinson |
| `.font-prose` | body copy | Syne |
| `.font-display` | headings, titles | Liberation Serif |
| `.font-quote` | pull quotes | Tangerine |
| `.font-meta` | dates, bylines, captions | Atkinson |
| `.font-code` | code, monospace | JetBrains Mono → Cascadia Code |

**Long-form content**: wrap it in `.prose`. That single class carries the whole
article type scale — heading sizes, list markers, blockquote rules, code-block
and table styling, all in brand colors. Opt a subtree out with `.not-prose`.
`.sr-only` is available for visually-hidden text.

**Tokens** — reference with `var(--*)`; these are the brand values:

- Color: `--color-link` `#9a3412` (a deep burnt orange — links are warm here,
  not blue), `--color-link-strong` `#7c2d12` for the hover/emphasis state,
  `--color-accent` `#fe9600` (the bright orange used for rules, markers and
  emphasis — too light for text, use it on surfaces and borders),
  `--color-paper` `#fffaf3` (the warm page background).
- Width: `--width-prose` `720px` (article measure), `--width-content` `960px`.
- Elevation: `--box-shadow`.
- Neutrals: `--black`, `--gray`, `--gray-light`, `--gray-dark`.

⚠️ **The neutrals are raw RGB triplets, not colors.** `--gray-dark` is
`34, 41, 57`. Write `color: rgb(var(--gray-dark))` — using `var(--gray-dark)`
bare silently produces no color. The named `--color-*` tokens above are ordinary
colors and need no wrapper.

Tailwind's default palette (`text-gray-700`, `bg-white`) is compiled in and safe
to use, but brand surfaces should come from the tokens.

## Where the truth lives

`styles.css` is the entry point; everything reachable from its `@import` closure
is what a design actually receives. Read `_ds_bundle.css` for the real rule
bodies — it is the compiled stylesheet, and the token values, role classes and
full `.prose` layer are all in there verbatim. `fonts/fonts.css` declares the six
bundled `@font-face` families; the Chinese families (LXGW WenKai, LXGW Heart
Serif, YShi-Written) load from a remote font service via `@import` at the top of
`_ds_bundle.css`.

## Idiomatic example

```html
<article lang="en" class="mx-auto max-w-prose p-6">
  <h1 class="font-display text-4xl" style="color: rgb(var(--black))">
    Reading notes
  </h1>
  <p class="font-meta text-sm" style="color: rgb(var(--gray))">
    <time datetime="2026-08-11">11 August 2026</time>
  </p>

  <div class="prose">
    <p>Body copy picks up the article type scale automatically.</p>
    <blockquote>Quotes, lists and code blocks are already styled.</blockquote>
  </div>

  <a href="/archive" class="font-ui" style="color: var(--color-link)">
    All posts →
  </a>
</article>
```
