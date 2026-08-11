// Bundle entry for design-sync. This design system is foundations-only:
// the blog's UI is authored in .astro components, which cannot be compiled
// into the React components claude.ai/design renders. The synced artifact is
// therefore the design *foundation* (tokens, fonts, type scale) and this
// entry is deliberately empty, producing an empty-bodied _ds_bundle.js.
//
// If a React component library is ever added to this repo, re-point
// cfg.entry at its built dist entry and the same pipeline will import it.
export {};
