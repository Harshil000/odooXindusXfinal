import * as dashboardRepo from "../repository/dashboard.repository.js";

const SUPPORTED_PERIODS = new Set(["weekly", "monthly", "365", "custom"]);

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function resolveDateRange(period, startDate, endDate) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEndExclusive = addDays(todayStart, 1);

  if (!SUPPORTED_PERIODS.has(period)) {
    const err = new Error("Invalid period. Use weekly, monthly, 365, or custom");
    err.status = 400;
    throw err;
  }

  if (period === "weekly") {
    return {
      start: addDays(todayStart, -6),
      end: todayEndExclusive,
    };
  }

  if (period === "monthly") {
    return {
      start: addDays(todayStart, -29),
      end: todayEndExclusive,
    };
  }

  if (period === "365") {
    return {
      start: addDays(todayStart, -364),
      end: todayEndExclusive,
    };
  }

  if (!startDate || !endDate) {
    const err = new Error("startDate and endDate are required for custom period");
    err.status = 400;
    throw err;
  }

  const start = startOfDay(new Date(startDate));
  const endInclusive = startOfDay(new Date(endDate));

  if (Number.isNaN(start.getTime()) || Number.isNaN(endInclusive.getTime())) {
    const err = new Error("Invalid custom date format. Use YYYY-MM-DD");
    err.status = 400;
    throw err;
  }

  if (endInclusive < start) {
    const err = new Error("endDate must be greater than or equal to startDate");
    err.status = 400;
    throw err;
  }

  return {
    start,
    end: addDays(endInclusive, 1),
  };
}

export async function getCategoryOrderAnalytics(restaurant_id, period, startDate, endDate) {
  if (!restaurant_id) {
    const err = new Error("Restaurant context is required");
    err.status = 401;
    throw err;
  }

  const { start, end } = resolveDateRange(period, startDate, endDate);
  const [categories, totalOrders] = await Promise.all([
    dashboardRepo.getCategoryOrderCounts(restaurant_id, start, end),
    dashboardRepo.getTotalOrdersInRange(restaurant_id, start, end),
  ]);

  return {
    period,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalOrders: Number(totalOrders) || 0,
    categories,
  };
}

export async function getDashboardOverview(restaurant_id, period, startDate, endDate) {
  if (!restaurant_id) {
    const err = new Error("Restaurant context is required");
    err.status = 401;
    throw err;
  }

  const { start, end } = resolveDateRange(period, startDate, endDate);
  const [overview, categories, products] = await Promise.all([
    dashboardRepo.getDashboardOverview(restaurant_id, start, end),
    dashboardRepo.getCategoryDashboard(restaurant_id, start, end),
    dashboardRepo.getProductDashboard(restaurant_id, start, end),
  ]);

  return {
    period,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    metrics: {
      totalOrders: Number(overview?.total_orders) || 0,
      settledOrders: Number(overview?.settled_orders) || 0,
      openOrders: Number(overview?.open_orders) || 0,
      totalRevenue: Number(overview?.total_revenue) || 0,
      averageOrderValue: Number(overview?.average_order_value) || 0,
      itemsSold: Number(overview?.items_sold) || 0,
      totalCategories: Number(overview?.total_categories) || 0,
      totalProducts: Number(overview?.total_products) || 0,
      activeProducts: Number(overview?.active_products) || 0,
      inactiveProducts: Number(overview?.inactive_products) || 0,
      paidOrdersCount: Number(overview?.paid_orders_count) || 0,
      completedOrders: Number(overview?.completed_orders) || 0,
      preparingOrders: Number(overview?.preparing_orders) || 0,
      toCookOrders: Number(overview?.to_cook_orders) || 0,
    },
    categories,
    products,
    dailyRevenue: Array.isArray(overview?.daily_revenue) ? overview.daily_revenue : [],
  };
}
