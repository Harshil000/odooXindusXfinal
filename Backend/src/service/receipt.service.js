import nodemailer from "nodemailer";

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return fallback;
  return value.toLowerCase() === "true";
}

function toMoney(value) {
  return Number(value || 0);
}

export function buildReceiptWithItemTax({ order, restaurantName, items, itemTaxes }) {
  const taxMap = new Map();
  if (Array.isArray(itemTaxes)) {
    for (const entry of itemTaxes) {
      if (!entry) continue;
      const key = String(entry.itemId || entry.orderItemId || "").trim();
      if (!key) continue;
      const percent = Number(entry.taxPercent);
      taxMap.set(key, Number.isFinite(percent) && percent >= 0 ? percent : 0);
    }
  }

  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const price = toMoney(item.price);
    const subtotal = toMoney(item.subtotal);
    const dbTaxPercent = Number(item.tax_percent);
    const taxPercent = taxMap.has(String(item.id))
      ? taxMap.get(String(item.id))
      : Number.isFinite(dbTaxPercent) && dbTaxPercent >= 0
        ? dbTaxPercent
        : 0;

    const taxAmount = (subtotal * taxPercent) / 100;
    const lineTotal = subtotal + taxAmount;

    return {
      id: item.id,
      productName: item.product_name || "Unnamed Item",
      quantity,
      price,
      subtotal,
      taxPercent,
      taxAmount,
      lineTotal,
    };
  });

  const itemCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = normalizedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + taxAmount;

  return {
    restaurantName: restaurantName || "Restaurant",
    orderId: order.id,
    status: order.status,
    tableNumber: order.table_number,
    itemCount,
    subtotal,
    taxAmount,
    total,
    generatedAt: new Date().toISOString(),
    items: normalizedItems,
  };
}

export function buildCombinedReceiptWithItemTax({ orders, restaurantName, orderItemsMap, itemTaxes }) {
  const taxMap = new Map();
  if (Array.isArray(itemTaxes)) {
    for (const entry of itemTaxes) {
      if (!entry) continue;
      const key = String(entry.itemId || entry.orderItemId || "").trim();
      if (!key) continue;
      const percent = Number(entry.taxPercent);
      taxMap.set(key, Number.isFinite(percent) && percent >= 0 ? percent : 0);
    }
  }

  const normalizedItems = [];

  for (const order of orders) {
    const items = orderItemsMap?.[order.id] || [];
    for (const item of items) {
      const quantity = Number(item.quantity || 0);
      const price = toMoney(item.price);
      const subtotal = toMoney(item.subtotal);
      const dbTaxPercent = Number(item.tax_percent);
      const taxPercent = taxMap.has(String(item.id))
        ? taxMap.get(String(item.id))
        : Number.isFinite(dbTaxPercent) && dbTaxPercent >= 0
          ? dbTaxPercent
          : 0;

      const taxAmount = (subtotal * taxPercent) / 100;
      const lineTotal = subtotal + taxAmount;

      normalizedItems.push({
        id: item.id,
        orderId: order.id,
        productName: item.product_name || "Unnamed Item",
        quantity,
        price,
        subtotal,
        taxPercent,
        taxAmount,
        lineTotal,
      });
    }
  }

  const itemCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = normalizedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + taxAmount;

  return {
    restaurantName: restaurantName || "Restaurant",
    orderIds: orders.map((order) => order.id),
    status: "paid",
    tableNumber: orders[0]?.table_number || null,
    itemCount,
    subtotal,
    taxAmount,
    total,
    generatedAt: new Date().toISOString(),
    items: normalizedItems,
  };
}

export function createReceiptHtml(receipt) {
  const isCombinedReceipt = Array.isArray(receipt.orderIds);
  const hasMultipleOrders = isCombinedReceipt && receipt.orderIds.length > 1;
  const itemsHtml = receipt.items.length
    ? receipt.items
      .map(
        (item) => `
          <tr>
            ${hasMultipleOrders ? `<td style="padding:8px;border:1px solid #ddd;">#${String(item.orderId).slice(0, 8)}</td>` : ""}
            <td style="padding:8px;border:1px solid #ddd;">${item.productName}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.price.toFixed(2)}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.subtotal.toFixed(2)}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.taxPercent.toFixed(2)}%</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.taxAmount.toFixed(2)}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.lineTotal.toFixed(2)}</td>
          </tr>
        `,
      )
      .join("")
    : `
      <tr>
        <td colspan="${hasMultipleOrders ? "8" : "7"}" style="padding:8px;border:1px solid #ddd;text-align:center;">No items found</td>
      </tr>
    `;

  const orderReference = isCombinedReceipt
    ? receipt.orderIds.map((orderId) => `#${String(orderId).slice(0, 8)}`).join(", ")
    : receipt.orderId || "N/A";

  return `
    <div style="font-family:Arial,sans-serif;max-width:840px;margin:0 auto;">
      <h2 style="margin:0 0 8px;">${receipt.restaurantName}</h2>
      <p style="margin:0 0 16px;color:#555;">${isCombinedReceipt ? "Combined Table Bill" : "Order Bill"}</p>
      <p><strong>${isCombinedReceipt ? (hasMultipleOrders ? "Order IDs" : "Order ID") : "Order ID"}:</strong> ${orderReference}</p>
      <p><strong>Table:</strong> ${receipt.tableNumber || "N/A"}</p>
      <p><strong>Status:</strong> ${receipt.status}</p>
      <p><strong>Generated At:</strong> ${receipt.generatedAt}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr style="background:#f5f5f5;">
            ${hasMultipleOrders ? '<th style="padding:8px;border:1px solid #ddd;text-align:left;">Order</th>' : ""}
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Item</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:center;">Qty</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Subtotal</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Tax %</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Tax</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div style="margin-top:16px;text-align:right;">
        <p style="margin:4px 0;"><strong>Items:</strong> ${receipt.itemCount}</p>
        <p style="margin:4px 0;"><strong>Subtotal:</strong> ${receipt.subtotal.toFixed(2)}</p>
        <p style="margin:4px 0;"><strong>Total Tax:</strong> ${receipt.taxAmount.toFixed(2)}</p>
        <p style="margin:4px 0;font-size:18px;"><strong>Total:</strong> ${receipt.total.toFixed(2)}</p>
      </div>
    </div>
  `;
}

export async function sendReceiptEmail({ toEmail, restaurantName, receipt }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = toBoolean(process.env.SMTP_SECURE, port === 465);
  const user = process.env.SMTP_USER;
  const passRaw = process.env.SMTP_PASS;
  const pass = typeof passRaw === "string" ? passRaw.replace(/\s+/g, "") : passRaw;
  const from = process.env.MAIL_FROM || process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    const err = new Error("SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM.");
    err.status = 500;
    throw err;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `Your bill from ${restaurantName}`,
    html: createReceiptHtml(receipt),
  });
}
