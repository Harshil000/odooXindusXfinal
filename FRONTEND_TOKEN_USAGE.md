# Frontend Token Usage Guide

## How to Send Token to Protected APIs

### Method 1: Using Authorization Header (Recommended)

```javascript
const token = localStorage.getItem("accessToken"); // Or from your store

const response = await axios.get("/api/sessions/active/123", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Method 2: Using Cookies

```javascript
// Server sets cookie on login
// Automatically sent with requests if httpOnly is set

// Make sure axios includes credentials:
axios.defaults.withCredentials = true;

const response = await axios.get("/api/sessions/active/123");
// Token is automatically included
```

### Method 3: Using Axios Interceptor

```javascript
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Now all requests include token automatically
const response = await axios.get("/api/sessions/active/123");
```

## Login Response

After login, you receive:

```javascript
{
  msg: 'Login successful',
  user: {
    id: user_id,
    name: user_name,
    email: user_email,
    role: user_role,
  },
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

Store the accessToken for future requests:

```javascript
localStorage.setItem("accessToken", response.data.accessToken);
```

## Public Routes (No Auth Required)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category details
- `GET /api/floors` - Get all floors
- `GET /api/floors/:id` - Get floor details

## Protected Routes (Auth Required)

All other routes require valid JWT token:

- `/api/sessions/*` - All operations
- `/api/orders/*` - All operations
- `/api/order-items/*` - All operations
- `/api/customers/*` - All operations
- `/api/categories` - (POST, PUT, DELETE)
- `/api/floors` - (POST, PUT, DELETE)

## Error Responses

### 401 Unauthorized

```javascript
{
  success: false,
  message: "Unauthorized - Token not found" // or "Invalid token"
}
```

### 404 Not Found

```javascript
{
  error: "Route not found";
}
```

### Server Error

```javascript
{
  message: "Error description",
  stack: "..." // Only in development
}
```
