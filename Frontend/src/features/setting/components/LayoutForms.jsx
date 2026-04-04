const LayoutForms = ({
  floors,
  floorName,
  tableForm,
  saving,
  error,
  onFloorName,
  onTableField,
  onAddFloor,
  onAddTable,
}) => {
  const handleFloorSubmit = (event) => {
    event.preventDefault();
    onAddFloor();
  };

  const handleTableSubmit = (event) => {
    event.preventDefault();
    onAddTable();
  };

  return (
    <aside className="panel form-panel">
      <div className="panel-scroll">
        <section className="form-section form-section-floor">
          <h2>Add Floor</h2>
          <form className="form-grid" onSubmit={handleFloorSubmit}>
            <label>
              Floor Name
              <input
                type="text"
                value={floorName}
                onChange={(event) => onFloorName(event.target.value)}
                placeholder="Ground Floor"
                required
              />
            </label>
            <div className="btn-row">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                Add Floor
              </button>
            </div>
          </form>
        </section>

        <section className="form-section form-section-table">
          <h2 className="spaced-title">Add Table</h2>
          <form className="form-grid" onSubmit={handleTableSubmit}>
            <label>
              Floor
              <select
                name="floor_id"
                value={tableForm.floor_id}
                onChange={(event) => onTableField(event.target.name, event.target.value)}
                required
              >
                <option value="">Choose floor</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Table Number
              <input
                name="table_number"
                value={tableForm.table_number}
                onChange={(event) => onTableField(event.target.name, event.target.value)}
                placeholder="T-12"
                required
              />
            </label>

            <label>
              Seats
              <input
                type="number"
                min="1"
                name="seats"
                value={tableForm.seats}
                onChange={(event) => onTableField(event.target.name, event.target.value)}
                placeholder="4"
                required
              />
            </label>

            <div className="btn-row">
              <button type="submit" className="btn btn-primary" disabled={!floors.length || saving}>
                Add Table
              </button>
            </div>
          </form>
        </section>

        {error && <p className="notice">{error}</p>}
      </div>
    </aside>
  );
};

export default LayoutForms;
