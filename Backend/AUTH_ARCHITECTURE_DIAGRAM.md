# Authentication Architecture Diagram

## Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /api/auth/login                                           │
│  { email, password }                                            │
│                                                                 │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │                                        │
        │     Express App Middleware Chain      │
        │                                        │
        │  1. cors()                             │
        │  2. express.json()                     │
        │  3. cookieParser()                     │
        │                                        │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │      Check Route Path                 │
        │   /api/auth/* → No Auth Required       │
        │   /api/other/* → Auth Required         │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │    Route Handler or Middleware         │
        │  (e.g., verifyToken)                   │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │   Controller → Repository → Database   │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │         Response Sent to Client        │
        └────────────────────────────────────────┘
```

## Authentication Flow

### Login Flow

```
┌──────────────────────────────────────────────────────┐
│         1. User Submits Credentials                  │
│            email + password                           │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     2. Auth Controller receives request              │
│        - Validates input format                      │
│        - Calls Auth Service                          │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     3. Auth Service                                  │
│        - Queries User Repository                     │
│        - Finds user by email                         │
│        - Verifies password (argon2)                  │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     4. User Repository                               │
│        - Queries PostgreSQL database                 │
│        - Returns user data                           │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     5. Generate JWT Token                            │
│        jwt.sign(                                     │
│          { id, role },                               │
│          JWT_ACCESS_SECRET,                          │
│          { expiresIn: '15m' }                        │
│        )                                             │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     6. Return Response                               │
│     {                                                │
│       msg: "Login successful",                       │
│       user: { id, name, email, role },               │
│       accessToken: "JWT_TOKEN"                       │
│     }                                                │
└──────────────────────────────────────────────────────┘
```

### Protected Route Access Flow

```
┌──────────────────────────────────────────────────────┐
│     1. Client Makes Protected Request                │
│        GET /api/sessions/active/1                    │
│        Authorization: Bearer TOKEN                   │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     2. Express Routes to Endpoint                    │
│        Route has verifyToken middleware              │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     3. verifyToken Middleware Executes               │
│        - Extract token from header/cookie            │
│        - Check if token exists                       │
│        → 401 if missing                              │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     4. Verify JWT Token                              │
│        jwt.verify(token, JWT_ACCESS_SECRET)          │
│        → 401 if invalid/expired                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     5. Decode Token & Add to req.user                │
│        req.user = { id, role }                       │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     6. Call next() - Execute Route Handler           │
│        Session Controller processes request          │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     7. Return Success Response                       │
│        Session data returned                         │
└──────────────────────────────────────────────────────┘
```

## Token Storage Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                   COOKIES vs HEADERS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  COOKIES:                                                   │
│  ✅ Automatically sent with requests                        │
│  ✅ Secure with httpOnly flag (prevents XSS)               │
│  ❌ Vulnerable to CSRF (need CSRF tokens)                   │
│  ❌ Sent to every request (larger payload)                  │
│                                                             │
│  AUTHORIZATION HEADER (Bearer Token):                      │
│  ✅ Explicit control over when sent                        │
│  ✅ Protected from CSRF attacks                            │
│  ✅ Only sent to API endpoints                             │
│  ❌ Must manually add to requests                          │
│  ❌ Vulnerable to XSS if stored in localStorage            │
│                                                             │
│  RECOMMENDATION:                                            │
│  Use Authorization Header with axios interceptor           │
│  Store token in secure storage (httpOnly cookie)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────┐
│     Route Handler throws/calls next(error)           │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     Error Middleware (handleError) Catches It        │
│     - Checks error type                              │
│     - Formats response                               │
│     - Adds stack trace (dev only)                    │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│     Return Error Response                            │
│     {                                                │
│       message: "Error description",                  │
│       stack: "..." (development only)                │
│     }                                                │
└──────────────────────────────────────────────────────┘
```

## Route Protection Matrix

```
┌────────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Route              │ POST     │ GET      │ PUT      │ DELETE   │
├────────────────────┼──────────┼──────────┼──────────┼──────────┤
│ /api/auth          │ ✖ AUTH   │          │          │          │
│ /api/sessions      │ ✔ AUTH   │ ✔ AUTH   │ ✔ AUTH   │ ✖        │
│ /api/orders        │ ✔ AUTH   │ ✔ AUTH   │ ✔ AUTH   │ ✔ AUTH   │
│ /api/order-items   │ ✔ AUTH   │ ✔ AUTH   │ ✔ AUTH   │ ✔ AUTH   │
│ /api/customers     │ ✔ AUTH   │ ✔ AUTH   │ ✔ AUTH   │ ✔ AUTH   │
│ /api/categories    │ ✔ AUTH   │ ✖ PUBLIC │ ✔ AUTH   │ ✔ AUTH   │
│ /api/floors        │ ✔ AUTH   │ ✖ PUBLIC │ ✔ AUTH   │ ✔ AUTH   │
└────────────────────┴──────────┴──────────┴──────────┴──────────┘

✔ AUTH   = Requires valid JWT token
✖ PUBLIC = No authentication needed
✖ AUTH   = Not implemented/Not allowed
```
