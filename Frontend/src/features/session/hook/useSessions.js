import { useCallback, useEffect, useState } from "react";
import {
  closeSession,
  createSession,
  getActiveSession,
  getAllSessions,
} from "../services/Session.api";

export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [allData, activeData] = await Promise.all([
        getAllSessions(),
        getActiveSession(),
      ]);

      setSessions(Array.isArray(allData) ? allData : []);
      setActiveSession(activeData || null);
    } catch (err) {
      setError(err?.message || "Failed to fetch sessions");
      setSessions([]);
      setActiveSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const openSession = useCallback(async () => {
    try {
      setActionLoading(true);
      setError("");
      const newSession = await createSession();
      setActiveSession(newSession);
      setSessions((prev) => [newSession, ...prev.filter((item) => item.id !== newSession.id)]);
      return newSession;
    } catch (err) {
      setError(err?.message || "Failed to open session");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const closeActiveSession = useCallback(async () => {
    if (!activeSession?.id) {
      return null;
    }

    try {
      setActionLoading(true);
      setError("");
      const closed = await closeSession(activeSession.id);
      setActiveSession(null);
      setSessions((prev) => {
        const exists = prev.some((item) => item.id === closed.id);
        if (!exists) {
          return [closed, ...prev];
        }

        return prev.map((item) => (item.id === closed.id ? closed : item));
      });
      return closed;
    } catch (err) {
      setError(err?.message || "Failed to close session");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [activeSession]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    activeSession,
    loading,
    actionLoading,
    error,
    openSession,
    closeActiveSession,
    refetchSessions: loadSessions,
  };
}