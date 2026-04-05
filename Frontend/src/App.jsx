import { useMemo } from "react";
import useReporting from "./features/reporting/hook/useReporting";
import "./features/reporting/styles/reporting.scss";

const PERIOD_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  365: "365 Days",
  custom: "Custom",
};

const PIE_COLORS = ["#8B6F4E", "#2E7D6B", "#D97D54", "#4F79B8", "#D4A017", "#7D5BA6", "#4BA3A8", "#A94B4B"];

function formatCurrency(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function formatInteger(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatRangeLabel(startDateIso, endDateIso) {
  if (!startDateIso || !endDateIso) return "";

  const start = new Date(startDateIso);
  const endExclusive = new Date(endDateIso);
  const endInclusive = new Date(endExclusive);
  endInclusive.setDate(endExclusive.getDate() - 1);

  return `${start.toLocaleDateString("en-IN")} - ${endInclusive.toLocaleDateString("en-IN")}`;
}

function buildPieGradient(items, valueKey) {
  const positiveItems = items.filter((item) => Number(item[valueKey]) > 0);
  const total = positiveItems.reduce((sum, item) => sum + Number(item[valueKey]), 0);

  if (total <= 0) {
    return { gradient: "conic-gradient(#d8d0c5 0% 100%)", segments: [] };
  }

  let cursor = 0;
  const segments = positiveItems.map((item, index) => {
    const value = Number(item[valueKey]) || 0;
    const share = (value / total) * 100;
    const start = cursor;
    const end = cursor + share;
    cursor = end;

    return {
      ...item,
      color: item.color || PIE_COLORS[index % PIE_COLORS.length],
      share,
      start,
      end,
    };
  });

  const gradient = segments.length
    ? `conic-gradient(${segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ")})`
    : "conic-gradient(#d8d0c5 0% 100%)";

  return { gradient, segments };
}

function buildLinePoints(values, width, height, padding) {
  if (!values.length) return { linePoints: "", areaPath: "" };

  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const maxValue = Math.max(...values, 0) || 1;
  const step = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const x = padding + step * index;
    const y = padding + innerHeight - (value / maxValue) * innerHeight;
    return { x, y };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const bottomY = height - padding;
  const areaPath = [
    `M ${points[0].x} ${bottomY}`,
    ...points.map((point, index) => `${index === 0 ? "L" : "L"} ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${bottomY} Z`,
  ].join(" ");

  return { linePoints, areaPath, points };
}

function MetricCard({ label, value, subtext }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{subtext}</small>
    </article>
  );
}

function App() {
  const {
    period,
    setPeriod,
    startDate,
    endDate,
    setCustomRange,
    loading,
    error,
    data,
    maxProductRevenue,
    pieTotal,
    revenueTrendPeak,
    refresh,
  } = useReporting();

  const pieData = useMemo(
    () => buildPieGradient(data.categories, "order_count"),
    [data.categories],
  );

  const statusCards = useMemo(
    () => [
      { label: "Paid", value: data.metrics.paidOrdersCount },
      { label: "Completed", value: data.metrics.completedOrders },
      { label: "Preparing", value: data.metrics.preparingOrders },
      { label: "To cook", value: data.metrics.toCookOrders },
    ],
    [data.metrics],
  );

  const revenueValues = useMemo(
    () => data.dailyRevenue.map((point) => Number(point.revenue) || 0),
    [data.dailyRevenue],
  );
  const revenueChart = useMemo(
    () => buildLinePoints(revenueValues, 760, 220, 20),
    [revenueValues],
  );

  return (
    <main className="reporting-page">
      <div className="reporting-shell">
        <header className="reporting-hero">
          <div>
            <p className="reporting-kicker">Owner dashboard</p>
            <h1>Restaurant performance at a glance</h1>
            <p>
              Track category demand, revenue, product performance, and order flow in one live view.
            </p>
          </div>
          <div className="reporting-hero-summary">
            <span>Selected range</span>
            <strong>{formatRangeLabel(data.startDate, data.endDate)}</strong>
            <small>{PERIOD_LABELS[period] || period}</small>
          </div>
        </header>

        <section className="reporting-filter-card" aria-label="Time Filters">
          <div className="period-options">
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`period-btn ${period === key ? "active" : ""}`}
                onClick={() => setPeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="custom-range">
              <label>
                Start Date
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                End Date
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }))
                  }
                />
              </label>

              <button type="button" onClick={refresh}>
                Apply Range
              </button>
            </div>
          )}
        </section>

        {loading ? <div className="reporting-loading">Loading analytics...</div> : null}
        {!loading && error ? <div className="reporting-error">{error}</div> : null}

        {!loading && !error ? (
          <>
            <section className="metric-grid" aria-label="Summary Metrics">
              <MetricCard label="Revenue" value={formatCurrency(data.metrics.totalRevenue)} subtext="From paid orders" />
              <MetricCard label="Total Orders" value={formatInteger(data.metrics.totalOrders)} subtext="Orders created in range" />
              <MetricCard label="Average Order Value" value={formatCurrency(data.metrics.averageOrderValue)} subtext="Paid order average" />
              <MetricCard label="Items Sold" value={formatInteger(data.metrics.itemsSold)} subtext="All sold quantities" />
              <MetricCard label="Products" value={formatInteger(data.metrics.totalProducts)} subtext={`${formatInteger(data.metrics.activeProducts)} active` } />
              <MetricCard label="Categories" value={formatInteger(data.metrics.totalCategories)} subtext="Menu groups" />
            </section>

            <section className="secondary-metrics">
              {statusCards.map((card) => (
                <article key={card.label} className="status-pill-card">
                  <span>{card.label}</span>
                  <strong>{formatInteger(card.value)}</strong>
                </article>
              ))}
              <article className="status-pill-card accent">
                <span>Open Orders</span>
                <strong>{formatInteger(data.metrics.openOrders)}</strong>
              </article>
              <article className="status-pill-card accent">
                <span>Inactive Products</span>
                <strong>{formatInteger(data.metrics.inactiveProducts)}</strong>
              </article>
            </section>

            <section className="dashboard-grid">
              <article className="dashboard-card pie-card">
                <div className="dashboard-card-head">
                  <div>
                    <h2>Category orders</h2>
                    <p>Share of paid orders by category</p>
                  </div>
                  <strong>{formatInteger(pieTotal)}</strong>
                </div>
                {pieData.segments.length ? (
                  <div className="pie-layout">
                    <div className="pie-chart" style={{ background: pieData.gradient }}>
                      <div className="pie-center">
                        <span>Total</span>
                        <strong>{formatInteger(pieTotal)}</strong>
                      </div>
                    </div>
                    <div className="pie-legend">
                      {pieData.segments.map((segment) => (
                        <div key={segment.id} className="legend-row">
                          <span className="legend-swatch" style={{ backgroundColor: segment.color }} />
                          <div>
                            <strong>{segment.name}</strong>
                            <small>
                              {formatInteger(segment.order_count)} orders · {formatCurrency(segment.revenue)} revenue
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="reporting-empty">No category sales found for this period.</div>
                )}
              </article>

              <article className="dashboard-card line-card">
                <div className="dashboard-card-head">
                  <div>
                    <h2>Revenue trend</h2>
                    <p>Daily paid revenue across the selected range</p>
                  </div>
                  <strong>{formatCurrency(data.metrics.totalRevenue)}</strong>
                </div>
                {data.dailyRevenue.length ? (
                  <div className="line-chart-wrap">
                    <svg viewBox="0 0 760 220" className="line-chart" role="img" aria-label="Revenue trend chart">
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B6F4E" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#8B6F4E" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <path d={revenueChart.areaPath} fill="url(#revenueFill)" />
                      <polyline points={revenueChart.linePoints} fill="none" stroke="#8B6F4E" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                      {revenueValues.map((value, index) => {
                        const step = revenueValues.length > 1 ? 720 / (revenueValues.length - 1) : 0;
                        const x = 20 + step * index;
                        const y = 200 - ((value / (revenueTrendPeak || 1)) * 180);
                        return <circle key={`${index}-${value}`} cx={x} cy={y} r="4" fill="#2E7D6B" />;
                      })}
                    </svg>
                    <div className="line-axis">
                      {data.dailyRevenue.map((point) => (
                        <span key={point.day}>
                          {new Date(point.day).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="reporting-empty">No revenue trend data available.</div>
                )}
              </article>
            </section>

            <section className="dashboard-grid bottom-grid">
              <article className="dashboard-card bar-card">
                <div className="dashboard-card-head">
                  <div>
                    <h2>Top products</h2>
                    <p>Revenue-led product performance</p>
                  </div>
                  <strong>{formatInteger(data.products.length)}</strong>
                </div>
                {data.products.length ? (
                  <div className="bar-list">
                    {data.products.map((product) => {
                      const revenue = Number(product.revenue) || 0;
                      const width = maxProductRevenue > 0 ? Math.max(8, Math.round((revenue / maxProductRevenue) * 100)) : 0;

                      return (
                        <div key={product.id} className="bar-row">
                          <div className="bar-label">
                            <strong>{product.name}</strong>
                            <small>{product.category_name}</small>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${width}%` }} />
                          </div>
                          <div className="bar-meta">
                            <span>{formatCurrency(revenue)}</span>
                            <small>{formatInteger(product.quantity_sold)} sold</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="reporting-empty">No product sales found for this period.</div>
                )}
              </article>

              <article className="dashboard-card table-card">
                <div className="dashboard-card-head">
                  <div>
                    <h2>Category leaderboard</h2>
                    <p>Orders, revenue, and item volume by category</p>
                  </div>
                </div>
                {data.categories.length ? (
                  <div className="mini-table-wrap">
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Orders</th>
                          <th>Revenue</th>
                          <th>Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.categories.slice(0, 8).map((category) => (
                          <tr key={category.id}>
                            <td>
                              <span className="table-color-dot" style={{ backgroundColor: category.color || PIE_COLORS[0] }} />
                              {category.name}
                            </td>
                            <td>{formatInteger(category.order_count)}</td>
                            <td>{formatCurrency(category.revenue)}</td>
                            <td>{formatInteger(category.items_sold)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="reporting-empty">No category leaderboard data available.</div>
                )}
              </article>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

export default App;
