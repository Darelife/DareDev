Run the browser regression suite from the repository root:

```sh
npm run test:themes --workspace=apps/web
```

Install Playwright's Chromium first (`npx playwright install chromium`), or use an
existing browser:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:themes --workspace=apps/web
```

Stop any existing Next.js development server for this workspace before running.
The suite starts Next.js on port 3100 and a read-only fixture API on port 4101.
It never uses production credentials or writes production content. Screenshots
for public/admin routes in both themes and viewport sizes are saved under
`test-results/`. Failed tests also retain a browser trace.

Theme definitions live in `src/components/themes/registry.ts`. The provider owns
selection, temporary previews, storage, and keyboard shortcuts. Sketchbook's
semantic CSS variables and component layouts live in `src/app/themes.css`;
existing declarations retain their exact Original values as fallbacks. Add future
themes to the typed registry and define their tokens and presentation styles.
Never key page/form/editor components by theme: switching must preserve state.
