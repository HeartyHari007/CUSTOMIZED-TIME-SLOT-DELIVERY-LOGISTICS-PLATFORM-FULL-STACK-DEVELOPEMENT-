const label = { scheduled: "Scheduled", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled" };
export default function Status({ s }) { return <span className={`tag ${s}`}>{label[s]}</span>; }

export const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
export const fmtSlot = (s) => (s ? `${fmtDate(s.date)}, ${s.startTime} to ${s.endTime} (${s.zone})` : "");

const STEPS = [["scheduled", "Booked"], ["out_for_delivery", "On the way"], ["delivered", "Delivered"]];
export function Progress({ status }) {
  if (status === "cancelled") return null;
  const at = STEPS.findIndex(([k]) => k === status);
  return (
    <ol className="progress" aria-label="Delivery progress">
      {STEPS.map(([k, t], i) => (
        <li key={k} className={i < at ? "done" : i === at ? "now" : ""}><span className="dot" />{t}</li>
      ))}
    </ol>
  );
}
