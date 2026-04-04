# Authentication Middleware Integration

## Auth Middleware Implementation

### File: `/src/middleware/auth.middleware.js`

#### `verifyToken` Middleware

- **Purpose**: Protects routes requiring authentication
- **Behavior**:
  - Extracts token from cookies OR Authorization header (Bearer token)
  - Verifies token using JWT_ACCESS_SECRET
  - Adds decoded user data to `req.user`
  - Returns 401 if token invalid or missing
- **Usage**: Add to protected routes

#### `optionalAuth` Middleware

- **Purpose**: For routes that are better with auth but don't require it
- **Behavior**:
  - Extracts token if available
  - Verifies and adds user to `req.user` if valid
  - Continues regardless (user may be undefined)

## Protected Routes

### 1. **Session Routes** (`/api/sessions`)

- ✅ POST `/` - Create session (requires auth)
- ✅ GET `/active/:restaurant_id` - Get active session (requires auth)
- ✅ PUT `/:id` - Update session (requires auth)
- ✅ GET `/:restaurant_id` - Get all sessions (requires auth)

### 2. **Order Routes** (`/api/orders`)

- ✅ POST `/` - Create order (requires auth)
- ✅ GET `/` - Get all orders (requires auth)
- ✅ PUT `/:id` - Update order (requires auth)
- ✅ DELETE `/:id` - Delete order (requires auth)

### 3. **Order Items Routes** (`/api/order-items`)

- ✅ POST `/` - Create order item (requires auth)
- ✅ GET `/` - Get all items (requires auth)
- ✅ GET `/order/:order_id` - Get items by order (requires auth)
- ✅ PUT `/:id` - Update item (requires auth)
- ✅ DELETE `/:id` - Delete item (requires auth)

### 4. **Customer Routes** (`/api/customers`)

- ✅ POST `/` - Create customer (requires auth)
- ✅ GET `/` - Get all customers (requires auth)
- ✅ GET `/:id` - Get customer by ID (requires auth)
- ✅ PUT `/:id` - Update customer (requires auth)
- ✅ DELETE `/:id` - Delete customer (requires auth)

### 5. **Category Routes** (`/api/categories`)

- ✅ POST `/` - Create category (requires auth)
- ✅ GET `/` - Get all categories (public)
- ✅ GET `/:id` - Get category by ID (public)
- ✅ PUT `/:id` - Update category (requires auth)
- ✅ DELETE `/:id` - Delete category (requires auth)

### 6. **Floor Routes** (`/api/floors`)

- ✅ POST `/` - Create floor (requires auth)
- ✅ GET `/` - Get all floors (public)
- ✅ GET `/:id` - Get floor by ID (public)
- ✅ PUT `/:id` - Update floor (requires auth)
- ✅ DELETE `/:id` - Delete floor (requires auth)

### 7. **Auth Routes** (`/api/auth`)

- ✅ POST `/register` - Register (public)
- ✅ POST `/login` - Login (public)

## How It Works

### 1. User Registration/Login

```
POST /api/auth/register
POST /api/auth/login
↓
Auth Controller calls User Repository
↓
Returns JWT token
```

### 2. Authenticated Request

```
Request with Authorization header or Cookie
↓
verifyToken middleware
↓
Validates JWT token using JWT_ACCESS_SECRET
↓
Adds decoded user to req.user
↓
Route handler executes
```

### 3. Token Storage

- Token can be stored in:
  - **Cookies**: `req.cookies.token`
  - **Authorization header**: `Authorization: Bearer <token>`

## Environment Variables Required

```env
JWT_ACCESS_SECRET=your_secret_key
DATABASE_URL=postgresql://...
NODE_ENV=development|production
```

## Middleware Chain in App

```
Express App
↓
cors()
↓
express.json()
↓
cookieParser() ← NEW
↓
Routes (with auth middleware)
↓
404 Handler
↓
Global Error Handler (handleError) ← UPDATED
```

## Error Handling

All errors are caught and passed to the global error handler via `next(error)`.

The error handler automatically:

- Catches database constraint violations
- Handles multer file upload errors
- Returns appropriate status codes
- Includes stack trace in development mode
