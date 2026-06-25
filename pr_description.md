🎯 **What:** Extracted the "expansion" tab logic and rendering from `src/app/admin/seo/page.tsx` into a new, dedicated `CityExpansionTab` component.
💡 **Why:** `AdminSeoPage` had grown too complex and long, housing logic and markup for many different tabs. By breaking out the `CityExpansionTab`, we reduce the file's overall complexity, improve readability, and localize the concerns regarding lead city expansion analysis to a single component.
✅ **Verification:** Verified by building the project (`npm run build`), ensuring all tests continue to pass (`npm run test`), and linting the codebase (`npm run lint`). The new file also matches standard formatting.
✨ **Result:** A more modular and maintainable `AdminSeoPage` with the expansion tab isolated logically.
