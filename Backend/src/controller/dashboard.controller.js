import * as dashboardService from "../service/dashboard.service.js";

export async function getCategoryOrderAnalytics(req, res, next) {
  try {
    const restaurant_id = req.user?.restaurant_id;
    const period = String(req.query.period || "weekly").trim().toLowerCase();
    const startDate = req.query.startDate ? String(req.query.startDate).trim() : null;
    const endDate = req.query.endDate ? String(req.query.endDate).trim() : null;

    const data = await dashboardService.getCategoryOrderAnalytics(
      restaurant_id,
      period,
      startDate,
      endDate,
    );

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getDashboardOverview(req, res, next) {
  try {
    const restaurant_id = req.user?.restaurant_id;
    const period = String(req.query.period || "weekly").trim().toLowerCase();
    const startDate = req.query.startDate ? String(req.query.startDate).trim() : null;
    const endDate = req.query.endDate ? String(req.query.endDate).trim() : null;

    const data = await dashboardService.getDashboardOverview(
      restaurant_id,
      period,
      startDate,
      endDate,
    );

    res.json(data);
  } catch (error) {
    next(error);
  }
}
