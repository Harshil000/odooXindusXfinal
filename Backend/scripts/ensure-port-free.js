import { execSync } from "child_process";

const PORT = 3000;

function getPidOnPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();

    if (!output) return null;

    const lines = output.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) {
        return Number(pid);
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isNodeProcess(pid) {
  try {
    const output = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();

    if (!output || output.includes("No tasks are running")) return false;

    const normalized = output.toLowerCase();
    return normalized.includes("node.exe") || normalized.includes("nodemon.exe");
  } catch {
    return false;
  }
}

function killPid(pid) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    console.log(`[dev] Freed port ${PORT} by stopping PID ${pid}`);
  } catch {
    console.warn(`[dev] Port ${PORT} is in use by PID ${pid}, but it could not be stopped automatically.`);
  }
}

const pid = getPidOnPort(PORT);
if (pid) {
  if (isNodeProcess(pid)) {
    killPid(pid);
  } else {
    console.warn(`[dev] Port ${PORT} is already in use by PID ${pid}. Stop that process before starting the backend.`);
    process.exit(1);
  }
}
