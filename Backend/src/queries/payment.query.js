// CREATE PAYMENT
export const CREATE_PAYMENT = `
INSERT INTO payments (
  restaurant_id,
  order_id,
  amount,
  payment_method,
  status,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  paid_at
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
RETURNING *;
`;

// GET ALL PAYMENTS
export const GET_PAYMENTS = `
SELECT
  p.id,
  p.restaurant_id,
  p.order_id,
  p.amount,
  p.payment_method,
  CASE
    WHEN p.status IN ('paid', 'completed') OR o.status = 'paid' THEN 'paid'
    ELSE p.status
  END AS status,
  p.razorpay_order_id,
  p.razorpay_payment_id,
  p.razorpay_signature,
  p.paid_at,
  p.created_at,
  p.updated_at
FROM payments p
LEFT JOIN orders o ON o.id = p.order_id
ORDER BY p.created_at DESC;
`;

export const GET_PAYMENTS_BY_RESTAURANT = `
SELECT
  p.id,
  p.restaurant_id,
  p.order_id,
  p.amount,
  p.payment_method,
  CASE
    WHEN p.status IN ('paid', 'completed') OR o.status = 'paid' THEN 'paid'
    ELSE p.status
  END AS status,
  p.razorpay_order_id,
  p.razorpay_payment_id,
  p.razorpay_signature,
  p.paid_at,
  p.created_at,
  p.updated_at
FROM payments p
LEFT JOIN orders o ON o.id = p.order_id
WHERE p.restaurant_id = $1
ORDER BY p.created_at DESC;
`;

// GET BY ORDER
export const GET_PAYMENT_BY_ORDER = `
SELECT * FROM payments
WHERE order_id = $1;
`;

// UPDATE STATUS
export const UPDATE_PAYMENT_STATUS = `
UPDATE payments
SET status = $1,
    razorpay_payment_id = $2,
    razorpay_signature = $3,
    paid_at = NOW()
WHERE id = $4
RETURNING *;
`;

// GET PAYMENT BY RAZORPAY PAYMENT ID
export const GET_PAYMENT_BY_RAZORPAY_PAYMENT_ID = `
SELECT * FROM payments WHERE razorpay_payment_id = $1;
`;

// GET PAYMENT BY RAZORPAY ORDER ID
export const GET_PAYMENT_BY_RAZORPAY_ORDER_ID = `
SELECT * FROM payments WHERE razorpay_order_id = $1;
`;

// GET PAYMENTS BY STATUS
export const GET_PAYMENTS_BY_STATUS = `
SELECT * FROM payments WHERE status = $1 ORDER BY created_at DESC;
`;

// UPDATE PAYMENT BY RAZORPAY PAYMENT ID
export const UPDATE_PAYMENT_BY_RAZORPAY_ID = `
UPDATE payments
SET status = $1, razorpay_signature = $2, updated_at = CURRENT_TIMESTAMP
WHERE razorpay_payment_id = $3
RETURNING *;
`;

// DELETE PAYMENT
export const DELETE_PAYMENT = `
DELETE FROM payments WHERE id = $1;
`;

// CREATE REFUND RECORD
export const CREATE_REFUND = `
INSERT INTO refunds (payment_id, razorpay_refund_id, amount, reason, status)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
`;

// GET REFUNDS BY PAYMENT ID
export const GET_REFUNDS_BY_PAYMENT_ID = `
SELECT * FROM refunds WHERE payment_id = $1 ORDER BY created_at DESC;
`;

// UPDATE REFUND STATUS
export const UPDATE_REFUND_STATUS = `
UPDATE refunds
SET status = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2
RETURNING *;
`;
