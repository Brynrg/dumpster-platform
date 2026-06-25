🎯 **What:**
Added integration tests for the admin pricing API route (`src/app/api/admin/pricing/route.ts`).

📊 **Coverage:**
The tests now cover:
- Unauthorized access (401 response).
- Invalid JSON payload parsing (400 response).
- Missing required fields, such as `region` (400 response).
- Supabase database upsert failures (500 response).
- Successful data upsert (200 response), including the correct mocking and invocation of the Supabase API chain with trimmed text and correctly transformed field types (using `Number`, `Math.trunc`).

✨ **Result:**
Increased overall test coverage and reliability for pricing configurations within the admin dashboard.
