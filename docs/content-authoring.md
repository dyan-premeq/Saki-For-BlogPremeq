# Content authoring contract

Plain Markdown continues to render without any component-specific syntax. MDX adds only the component names that the engine explicitly publishes through its literal `contentComponents` map. Content must not import files from the engine with relative paths: those paths are implementation details and may move.

The same component map is supplied to post and About content. A name is available only after it has been deliberately added to that map; there is no file discovery, URL inference, or provider registry.

## TerminalFrame

`TerminalFrame` is the first mapped component. Give every frame a short, meaningful `title`, then author the terminal output as children:

```mdx
<TerminalFrame title="Terminal session: site check">
  <p>$ pnpm check</p>
  <p>Result: checks passed.</p>
</TerminalFrame>
```

The required title is visible and supplies the frame's accessible name. The component owns its semantic wrapper and presentation; the content owns the child text. Do not replace those children with an iframe.

Before a separate content repository uses a newly mapped component, pin that repository to the engine revision that supplies the component. This avoids publishing MDX that an older engine cannot render.

## Typography language overrides

Ordinary prose uses a Latin-first stack with its paired CJK role as the next fallback. When a passage has a known language, use standard `lang` markup as an explicit escape hatch:

```mdx
<span lang="en">An explicitly English passage.</span>
<span lang="zh-CN">一段明确标注为中文的内容。</span>
```

English tags keep the current role's Latin face first. Chinese tags reverse the same pair so the CJK face is first. Do not create spans merely by scanning text; unannotated mixed-language prose remains supported.

## Future mapped components

A complex mapped component that owns its internal layout must put `not-prose` on its root. It must also own the presentation of its descendants so prose selectors cannot leak into the component. Small inline components may remain inside normal prose when inheriting prose styling is intentional.

This foundation does not supply provider embeds, music integrations, friend APIs, or WebGL components. Add any future capability explicitly, with its own authoring and loading contract, instead of inferring behavior from arbitrary URLs.
