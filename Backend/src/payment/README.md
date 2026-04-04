# Razorpay Payment Integration

This folder contains all the necessary files for integrating Razorpay payment gateway into your POS application. The implementation follows a modular architecture with separate layers for configuration, service, controller, and repository.

## Folder Structure

```
Backend/src/payment/
├── razorpay.config.js      # Initialize Razorpay instance
├── razorpay.service.js     # Business logic for Razorpay operations and database integration
├── razorpay.controller.js  # API endpoints for payments
├── payment.route.js        # Routes for payment endpoints
└── README.md              # This documentation

Backend/src/queries/payment.query.js     # SQL queries for payment operations
Backend/src/repository/payment.repository.js  # Database operations for payments
```

## Architecture

The payment system follows a clean architecture pattern:

1. **Routes** (`payment.route.js`) - Define API endpoints and middleware
2. **Controller** (`razorpay.controller.js`) - Handle HTTP requests and responses
3. **Service** (`razorpay.service.js`) - Business logic and Razorpay API integration
4. **Repository** (`payment.repository.js`) - Database operations
5. **Queries** (`payment.query.js`) - SQL query definitions

## Setup Instructions

### 1. Install Razorpay Package

```bash
npm install razorpay
```

### 2. Add Razorpay Credentials to `.env`

Update your `.env` file with Razorpay credentials:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

Get your credentials from: https://dashboard.razorpay.com/access/signin

### 3. Database Tables

Ensure you have the following tables in your database:

```sql
-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER,
  order_id INTEGER,
  amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  status VARCHAR(50),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refunds table
CREATE TABLE refunds (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER REFERENCES payments(id),
  razorpay_refund_id VARCHAR(255),
  amount DECIMAL(10,2),
  reason TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

All endpoints require authentication (JWT token in headers or cookies).

### Create Payment Order

- **POST** `/api/payments/order`
- **Body:**
  ```json
  {
    "amount": 500,
    "currency": "INR",
    "order_id": 123,
    "restaurant_id": 1
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "razorpayOrder": {
        "id": "order_1234567890",
        "amount": 50000,
        "currency": "INR"
      },
      "paymentRecord": {
        "id": 1,
        "status": "pending"
      }
    }
  }
  ```

### Verify Payment

- **POST** `/api/payments/verify`
- **Body:**
  ```json
  {
    "paymentId": "pay_1234567890",
    "orderId": "order_1234567890",
    "signature": "signature_from_client"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Payment verified and recorded successfully",
    "verification": {
      "success": true,
      "isSignatureValid": true,
      "message": "Payment verified successfully"
    }
  }
  ```

### Get Payment Details from Razorpay

- **GET** `/api/payments/payment/:paymentId`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "pay_1234567890",
      "amount": 50000,
      "status": "captured"
    }
  }
  ```

### Get Order Details from Razorpay

- **GET** `/api/payments/order/:orderId`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "order_1234567890",
      "amount": 50000,
      "status": "paid"
    }
  }
  ```

### Get Payment Records from Database

- **GET** `/api/payments/records/order/:orderId`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "order_id": 123,
        "amount": 500,
        "status": "completed",
        "razorpay_payment_id": "pay_1234567890"
      }
    ]
  }
  ```

### Get Payment Record by Razorpay Payment ID

- **GET** `/api/payments/records/payment/:razorpayPaymentId`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "order_id": 123,
      "status": "completed"
    }
  }
  ```

### Process Refund

- **POST** `/api/payments/refund`
- **Body:**
  ```json
  {
    "paymentId": "pay_1234567890",
    "amount": 300,
    "reason": "Customer request"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "razorpayRefund": {
        "id": "rfnd_1234567890",
        "amount": 30000,
        "status": "processed"
      },
      "databaseRecord": {
        "id": 1,
        "status": "processed"
      }
    }
  }
  ```

### Get Refunds for Payment

- **GET** `/api/payments/refunds/:paymentId`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "razorpay_refund_id": "rfnd_1234567890",
        "amount": 300,
        "status": "processed"
      }
    ]
  }
  ```

## Service Functions

### Razorpay Operations

- `createRazorpayOrder(amount, currency)` - Creates a new payment order in Razorpay
- `verifyRazorpayPayment(paymentId, orderId, signature, keySecret)` - Verifies payment signature
- `fetchPaymentDetails(paymentId)` - Retrieves payment details from Razorpay
- `fetchOrderDetails(orderId)` - Retrieves order details from Razorpay
- `processRefund(paymentId, amount, reason)` - Processes a refund through Razorpay

### Database Operations

- `createPaymentRecord(...)` - Creates a payment record in the database
- `updatePaymentStatus(status, signature, paymentId)` - Updates payment status after verification
- `getPaymentByOrderId(order_id)` - Retrieves payments for an order
- `getPaymentByRazorpayId(razorpay_payment_id)` - Retrieves payment by Razorpay ID
- `getPaymentByRazorpayOrderId(razorpay_order_id)` - Retrieves payment by Razorpay order ID
- `getRefundsForPayment(payment_id)` - Retrieves refunds for a payment

## Frontend Integration Example

```javascript
// 1. Create order and get payment details from backend
const orderResponse = await fetch("/api/payments/order", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  credentials: "include",
  body: JSON.stringify({
    amount: 500,
    currency: "INR",
    order_id: orderId,
    restaurant_id: restaurantId,
  }),
});

const { data: orderData } = await orderResponse.json();

// 2. Initialize Razorpay options
const options = {
  key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Public key from frontend env
  amount: orderData.razorpayOrder.amount,
  currency: orderData.razorpayOrder.currency,
  order_id: orderData.razorpayOrder.id,
  handler: async function (response) {
    // 3. Verify payment on backend
    const verifyResponse = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
      }),
    });

    const result = await verifyResponse.json();

    if (result.success) {
      console.log("Payment successful!");
      // Update order status, redirect to success page, etc.
    } else {
      console.log("Payment verification failed");
    }
  },
};

// 4. Open Razorpay checkout
new Razorpay(options).open();
```

## Error Handling

All endpoints return structured responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Security Notes

1. Always verify payment signatures on the backend
2. Never expose `RAZORPAY_KEY_SECRET` to the frontend
3. All payment endpoints require authentication
4. Store payment details securely in the database
5. Implement idempotency to prevent duplicate payments
6. Use HTTPS for all payment-related communications

## Testing

For testing, use Razorpay's test card details:

- Card Number: `4111111111111111`
- Expiry: Any future date
- CVV: Any 3-digit number

For test credentials, visit: https://razorpay.com/docs/payments/test-account/

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Orders API](https://razorpay.com/docs/api/orders/)
- [Razorpay Payments API](https://razorpay.com/docs/api/payments/)
- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Payment Gateway Security Best Practices](https://razorpay.com/docs/security/)
