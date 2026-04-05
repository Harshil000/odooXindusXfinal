import { useSessions } from "../hook/useSessions";
import NoSession from "../components/NoSession";
import { useContext } from "react";
import { AuthContext } from "../../auth/auth.context";
import "./Session.scss";

const Session = () => {
    const { user } = useContext(AuthContext);
    const isOwner = String(user?.role || "").toLowerCase() === "owner";

    const {
        sessions,
        loading,
        error,
        activeSession,
        actionLoading,
        openSession,
        closeActiveSession,
    } = useSessions();

    const formatDateTime = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleString();
    };

    const formatCurrency = (value) => {
        const amount = Number.parseFloat(value ?? 0);
        if (Number.isNaN(amount)) {
            return "INR 0.00";
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const handleStartSession = async () => {
        await openSession();
    };

    const handleCloseSession = async () => {
        await closeActiveSession();
    };

    if (loading) {
        return <p className="session-status-text">Loading sessions...</p>;
    }

    if (sessions.length === 0) {
        return (
            <NoSession
                onStart={handleStartSession}
                actionLoading={actionLoading}
                error={error}
            />
        );
    }

    return (
        <section className="session-page">
            <header className="session-page__header">
                <div>
                    <h1>POS Sessions</h1>
                    <p>Track running sessions and review closed session summaries.</p>
                </div>
                {activeSession ? (
                    <button
                        type="button"
                        className="session-btn session-btn--danger"
                        disabled={actionLoading}
                        onClick={handleCloseSession}
                    >
                        {actionLoading ? "Closing..." : "Close Running Session"}
                    </button>
                ) : (
                    <button
                        type="button"
                        className="session-btn"
                        disabled={actionLoading || !isOwner}
                        onClick={handleStartSession}
                    >
                        {actionLoading ? "Starting..." : "Start New Session"}
                    </button>
                )}
            </header>

            {!isOwner ? (
                <p className="session-status-text">Only owner can start a new session.</p>
            ) : null}

            {error && <p className="session-status-text session-status-text--error">{error}</p>}

            <div className="session-grid">
                {sessions.map((session) => (
                    <article
                        key={session.id}
                        className={`session-card ${session.closed_at ? "session-card--closed" : "session-card--active"}`}
                    >
                        <div className="session-card__top">
                            <h2>Session</h2>
                            <span className={`session-badge ${session.closed_at ? "session-badge--closed" : "session-badge--active"}`}>
                                {session.closed_at ? "Closed" : "Running"}
                            </span>
                        </div>

                        <div className="session-card__details">
                            <p><strong>Started At:</strong> {formatDateTime(session.opened_at)}</p>
                            <p><strong>Closed At:</strong> {formatDateTime(session.closed_at)}</p>
                            <p><strong>Total Cost:</strong> {formatCurrency(session.total_sales)}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default Session;