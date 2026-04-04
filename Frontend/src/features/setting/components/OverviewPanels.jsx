const FloorOverview = ({ floors, tableCountByFloor, loading, onRemoveFloor }) => {
  return (
    <section className="overview-block">
      <h2>Floors Overview</h2>
      <div className="table-shell overview-scroll">
        <table className="layout-table">
          <thead>
            <tr>
              <th>Floor</th>
              <th>Tables</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && floors.length === 0 && (
              <tr>
                <td colSpan="3" className="table-empty-cell">No floors added yet.</td>
              </tr>
            )}
            {floors.map((floor) => (
              <tr key={floor.id}>
                <td>{floor.name}</td>
                <td>{tableCountByFloor[floor.id] || 0}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onRemoveFloor(floor.id)}
                  >
                    Remove Floor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const TableOverview = ({ tables, floorNameById, loading, onRemoveTable }) => {
  return (
    <section className="overview-block">
      <h2>Tables</h2>
      <div className="table-shell overview-scroll">
        <table className="layout-table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Floor</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && tables.length === 0 && (
              <tr>
                <td colSpan="5" className="table-empty-cell">No tables created yet.</td>
              </tr>
            )}
            {tables.map((table) => (
              <tr key={table.id}>
                <td>{table.table_number}</td>
                <td>{floorNameById[table.floor_id] || "Unknown"}</td>
                <td>{table.seats}</td>
                <td>
                  <span className="status-pill">{table.status || "available"}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-subtle"
                    onClick={() => onRemoveTable(table.id)}
                  >
                    Remove Table
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const OverviewPanels = (props) => {
  return (
    <div className="panel overview-panel">
      <FloorOverview
        floors={props.floors}
        tableCountByFloor={props.tableCountByFloor}
        loading={props.loading}
        onRemoveFloor={props.onRemoveFloor}
      />
      <TableOverview
        tables={props.tables}
        floorNameById={props.floorNameById}
        loading={props.loading}
        onRemoveTable={props.onRemoveTable}
      />
    </div>
  );
};

export default OverviewPanels;
