# CarterPCs Portfolio Concept

An experimental interactive portfolio and digital experience inspired by CarterPCs and his technology content.

> **Disclaimer:** This is an independent, unofficial creative project. It is not affiliated with, endorsed by, or officially associated with CarterPCs.

## Status

Project foundation initialized: build tooling, design tokens, motion/accessibility
foundations, and test setup are in place. No final sections (Hero, navigation,
etc.) have been built yet — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for what's planned.

## Stack

React, Vite, TypeScript, CSS Modules with design tokens, GSAP + ScrollTrigger,
Lenis. Full rationale in [`docs/TECH_STACK.md`](docs/TECH_STACK.md).

## Development

```bash
npm install
npm run dev          # start the dev server
npm run build        # type-check and build for production
npm run preview      # preview the production build locally
npm run lint          # lint source files
npm run format        # format source files with Prettier
npm run typecheck     # type-check without emitting
npm run test           # run unit/component tests in watch mode
npm run test:run       # run unit/component tests once
npm run test:e2e       # run Playwright end-to-end smoke tests
```

## Rights and reuse

Copyright © 2026 Noah Walker (WalkerTech15). **All rights reserved for new
original contributions from 27 October 2026.** No reuse, modification, or
redistribution permission is granted for that new material without prior
written permission, except where applicable law or other existing terms permit it.

**Earlier code was released under MIT. Those permissions still apply to
previously MIT-licensed material**, even when it appears in later versions.
See [LICENSE](LICENSE) and the preserved
[prior MIT terms](LICENSE-MIT-PRIOR-VERSIONS).

Third-party dependencies, fonts, media, and CarterPCs' identity remain subject
to their owners' rights and licenses. Public GitHub viewing and forking rights
also remain governed by GitHub's terms. This is not an official CarterPCs project.

## Documentation

Project intent, design direction, content planning, research, architecture,
and technical stack decisions all live in [`docs/`](docs/).
