🎯 **What:**
The getRequestOrigin function is a crucial part of the application that handles identifying the host and protocol of the incoming request. However, it lacked testing, particularly for its various header fallback mechanisms and edge cases. This PR introduces a complete test suite for `src/lib/origin.ts`.

📊 **Coverage:**
The added tests cover the following scenarios:
1. Handling of `x-forwarded-host` and `x-forwarded-proto`.
2. Fallback to `host` when `x-forwarded-host` is not present.
3. Fallback to `https` when `x-forwarded-proto` is not present.
4. Prioritization of `x-forwarded-host` over `host` when both are provided.
5. Fallback to `http://localhost:3000` when no host headers are present.

✨ **Result:**
The test coverage for this function has dramatically improved. As well, the `vitest` testing framework has been successfully integrated and set up via `npm run test` ensuring that future tests can easily be added to the project.
