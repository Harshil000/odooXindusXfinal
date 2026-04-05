import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardOverview } from "../services/reporting.api";

const PERIODS = ["weekly", "monthly", "365", "custom"];

function toInputDate(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDefaultCustomRange() {
  const now = new Date();
  const endDate = toInputDate(now);

  const start = new Date(now);
  start.setDate(now.getDate() - 6);

  return {
    startDate: toInputDate(start),
    endDate,
  };
}

export default function useReporting() {
  const [{ startDate, endDate }, setCustomRange] = useState(createDefaultCustomRange);
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    period: "weekly",
    startDate: null,
    endDate: null,
    metrics: {
      totalOrders: 0,
      settledOrders: 0,
      openOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      itemsSold: 0,
      totalCategories: 0,
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
      paidOrdersCount: 0,
      completedOrders: 0,
      preparingOrders: 0,
      toCookOrders: 0,
    },
    categories: [],
    products: [],
    dailyRevenue: [],
  });

  const fetchAnalytics = useCallback(async () => {
    if (!PERIODS.includes(period)) return;

    setLoading(true);
    setError("");

    try {
      const params =
        period === "custom"
          ? { period, startDate, endDate }
          : { period };

      const response = await getDashboardOverview(params);
      setData({
        period: response.period || period,
        startDate: response.startDate || null,
        endDate: response.endDate || null,
        metrics: {
          totalOrders: Number(response.metrics?.totalOrders) || 0,
          settledOrders: Number(response.metrics?.settledOrders) || 0,
          openOrders: Number(response.metrics?.openOrders) || 0,
          totalRevenue: Number(response.metrics?.totalRevenue) || 0,
          averageOrderValue: Number(response.metrics?.averageOrderValue) || 0,
          itemsSold: Number(response.metrics?.itemsSold) || 0,
          totalCategories: Number(response.metrics?.totalCategories) || 0,
          totalProducts: Number(response.metrics?.totalProducts) || 0,
          activeProducts: Number(response.metrics?.activeProducts) || 0,
          inactiveProducts: Number(response.metrics?.inactiveProducts) || 0,
          paidOrdersCount: Number(response.metrics?.paidOrdersCount) || 0,
          completedOrders: Number(response.metrics?.completedOrders) || 0,
          preparingOrders: Number(response.metrics?.preparingOrders) || 0,
          toCookOrders: Number(response.metrics?.toCookOrders) || 0,
        },
        categories: Array.isArray(response.categories) ? response.categories : [],
        products: Array.isArray(response.products) ? response.products : [],
        dailyRevenue: Array.isArray(response.dailyRevenue) ? response.dailyRevenue : [],
      });
    } catch (fetchError) {
      setError(fetchError?.message || "Could not load reporting data");
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const maxOrderCount = useMemo(
    () => Math.max(...data.categories.map((category) => Number(category.order_count) || 0), 0),
    [data.categories],
  );

  const maxProductRevenue = useMemo(
    () => Math.max(...data.products.map((product) => Number(product.revenue) || 0), 0),
    [data.products],
  );

  const pieTotal = useMemo(
    () => data.categories.reduce((sum, category) => sum + (Number(category.order_count) || 0), 0),
    [data.categories],
  );

  const revenueTrendPeak = useMemo(
    () => Math.max(...data.dailyRevenue.map((point) => Number(point.revenue) || 0), 0),
    [data.dailyRevenue],
  );

  return {
    period,
    setPeriod,
    startDate,
    endDate,
    setCustomRange,
    loading,
    error,
    data,
    maxOrderCount,
    maxProductRevenue,
    pieTotal,
    revenueTrendPeak,
    refresh: fetchAnalytics,
  };
}
