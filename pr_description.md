🔒 Fix insecure static admin cookie

🎯 **What:** The vulnerability fixed
The system was using a static value (`"1"`) for the admin session cookie, making it trivial for anyone to bypass authentication by simply manually setting a cookie `admin=1` in their browser if they knew or guessed the cookie name.

⚠️ **Risk:** The potential impact if left unfixed
Any user could gain unauthorized access to all protected admin endpoints and the admin dashboard by spoofing the static cookie. This could lead to unauthorized data disclosure, modification of SEO tasks, disposal facility data, pricing, and triggering notifications.

🛡️ **Solution:** How the fix addresses the vulnerability
This change replaces the static cookie with a securely signed JSON Web Token (JWT) using the `jose` library (which is Edge-compatible for Next.js middleware).
- Added a new `adminAuth` library with `signAdminToken` and `verifyAdminToken` functions.
- The login route now generates a signed JWT that expires in 8 hours and sets it as the `"admin"` cookie.
- The middleware and all protected API routes now verify the JWT signature and expiration before allowing access.
