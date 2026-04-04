import "./NoSession.scss";

const NoSession = ({ onStart, actionLoading, error }) => {
  return (
    <section className="no-session-wrap">
      <div className="no-session-card">
        <h2>No Sessions Found</h2>
        <p>There are no active sessions right now. Start a new session to continue.</p>
        <button type="button" className="no-session-btn" onClick={onStart} disabled={actionLoading}>
          {actionLoading ? "Starting..." : "Start New Session"}
        </button>
        {error && <p className="no-session-error">{error}</p>}
      </div>
    </section>
  );
};

export default NoSession;