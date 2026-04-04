const LayoutMetrics = ({ floorCount, tableCount, totalSeats }) => {
  return (
    <section className="metric-grid">
      <article className="metric-card">
        <span className="label">Total Floors</span>
        <strong>{floorCount}</strong>
      </article>
      <article className="metric-card">
        <span className="label">Total Tables</span>
        <strong>{tableCount}</strong>
      </article>
      <article className="metric-card">
        <span className="label">Total Seats</span>
        <strong>{totalSeats}</strong>
      </article>
    </section>
  );
};

export default LayoutMetrics;
