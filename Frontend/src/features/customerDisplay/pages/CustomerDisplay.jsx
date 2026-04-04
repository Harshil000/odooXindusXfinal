import { useEffect, useMemo, useState } from "react";
import { generateTrackToken, getTables } from "../services/customerDisplay.api";
import "../styles/customerDisplay.scss";

const CustomerDisplay = () => {
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTables = async () => {
      setLoading(true);
      try {
        const data = await getTables();
        setTables(data || []);
        if (data?.length) {
          setSelectedTableId(data[0].id);
        }
      } catch (requestError) {
        setError(requestError?.message || "Could not load tables");
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, []);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId),
    [selectedTableId, tables],
  );

  const handleGenerate = async () => {
    if (!selectedTableId) return;
    setCreating(true);
    setError("");
    try {
      const response = await generateTrackToken({ table_id: selectedTableId });
      setTrackUrl(response.track_url || "");
    } catch (requestError) {
      setError(requestError?.message || "Could not generate QR link");
    } finally {
      setCreating(false);
    }
  };

  const qrSrc = trackUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(trackUrl)}`
    : "";

  return (
    <main className="customer-display-page">
      <div className="customer-display-card">
        <h1>Customer Display QR</h1>
        <p>Select a table and generate QR for live order status tracking.</p>

        {loading ? (
          <p>Loading tables...</p>
        ) : (
          <div className="display-controls">
            <label>
              Table
              <select
                value={selectedTableId}
                onChange={(event) => setSelectedTableId(event.target.value)}
              >
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.table_number} ({table.status})
                  </option>
                ))}
              </select>
            </label>

            <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={creating || !selectedTableId}>
              {creating ? "Generating..." : "Generate QR"}
            </button>
          </div>
        )}

        {error && <div className="display-error">{error}</div>}

        {trackUrl && (
          <div className="qr-shell">
            <h2>Table {selectedTable?.table_number || "-"}</h2>
            <img src={qrSrc} alt="Customer tracking QR code" />
            <a href={trackUrl} target="_blank" rel="noreferrer">
              Open tracking page
            </a>
          </div>
        )}
      </div>
    </main>
  );
};

export default CustomerDisplay;
