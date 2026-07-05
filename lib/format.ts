export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatRelative(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  if (Math.abs(diffMins) < 1) return "now";
  if (diffMins > 0) {
    if (diffMins < 60) return `in ${diffMins}m`;
    return `in ${Math.round(diffMins / 60)}h`;
  }
  const past = Math.abs(diffMins);
  if (past < 60) return `${past}m ago`;
  return `${Math.round(past / 60)}h ago`;
}
