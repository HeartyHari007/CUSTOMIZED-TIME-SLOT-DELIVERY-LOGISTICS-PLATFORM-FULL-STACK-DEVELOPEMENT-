import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";
import { fmtDate } from "../components/Status.jsx";

const today = () => new Date().toISOString().slice(0, 10);

export default function Book() {
  const nav = useNavigate();
  const [date, setDate] = useState(today());
  const [zone, setZone] = useState("");
  const [slots, setSlots] = useState([]);
  const [pick, setPick] = useState(null);
  const [f, setF] = useState({ packageDesc: "", weightKg: 1, pickupAddress: "", dropAddress: "", instructions: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = () => api.get("/slots", { params: { date, zone } }).then((r) => setSlots(r.data));
  useEffect(() => { load(); setPick(null); }, [date, zone]);

  const base = 50, weightFee = Math.ceil(f.weightKg || 1) * 10, slotFee = pick?.fee || 0;
  const total = base + weightFee + slotFee;

  const submit = async (e) => {
    e.preventDefault(); setMsg(""); setBusy(true);
    try { await api.post("/orders", { ...f, weightKg: Number(f.weightKg), slotId: pick._id }); nav("/orders"); }
    catch (x) { setMsg(errMsg(x)); load(); setPick(null); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><h2>Book a delivery</h2><p className="muted">Choose a window, then tell us where the parcel goes.</p></div>
        <ol className="steps">
          <li className={!pick ? "now" : "done"}><span>1</span>Choose window</li>
          <li className={pick ? "now" : ""}><span>2</span>Delivery details</li>
        </ol>
      </div>

      <div className="toolbar">
        <label>Date<input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label>Area<input placeholder="e.g. Adyar" value={zone} onChange={(e) => setZone(e.target.value)} /></label>
        <p className="muted toolbar-note">{slots.length} window{slots.length === 1 ? "" : "s"} open on {fmtDate(date)}</p>
      </div>

      {slots.length === 0 && <div className="empty-box">No open windows for this date and area. Try another day or clear the area filter.</div>}
      <div className="grid">
        {slots.map((s) => {
          const left = s.capacity - s.booked, pct = Math.round((s.booked / s.capacity) * 100);
          return (
            <button key={s._id} className={`slot ${pick?._id === s._id ? "on" : ""}`} onClick={() => setPick(s)} aria-pressed={pick?._id === s._id}>
              <span className="slot-time">{s.startTime}<i> – </i>{s.endTime}</span>
              <span className="slot-zone">{s.zone}</span>
              <span className="bar-track"><span className={`bar-fill ${pct >= 70 ? "hot" : ""}`} style={{ width: pct + "%" }} /></span>
              <span className="slot-meta"><span className={left <= 2 ? "low" : ""}>{left} of {s.capacity} left</span>{s.fee ? <span className="badge">+₹{s.fee}</span> : <span className="muted">No extra fee</span>}</span>
            </button>
          );
        })}
      </div>
      {!pick && msg && <p className="err">{msg}</p>}

      {pick && (
        <form className="split-form" onSubmit={submit}>
          <div className="panel">
            <h3>Delivery details</h3>
            <label>What are you sending?<input required value={f.packageDesc} onChange={set("packageDesc")} placeholder="e.g. Documents, laptop box" /></label>
            <label>Weight (kg)<input type="number" min="0.1" step="0.1" required value={f.weightKg} onChange={set("weightKg")} /></label>
            <div className="two">
              <label>Pickup address<textarea required value={f.pickupAddress} onChange={set("pickupAddress")} /></label>
              <label>Drop address<textarea required value={f.dropAddress} onChange={set("dropAddress")} /></label>
            </div>
            <label>Notes for the driver (optional)<input value={f.instructions} onChange={set("instructions")} placeholder="Gate code, landmark…" /></label>
            {msg && <p className="err" role="alert">{msg}</p>}
          </div>
          <aside className="panel summary">
            <h3>Order summary</h3>
            <p className="sum-slot"><b>{fmtDate(pick.date)}</b><br />{pick.startTime} – {pick.endTime} · {pick.zone}</p>
            <dl>
              <dt>Base delivery</dt><dd>₹{base}</dd>
              <dt>Weight ({Math.ceil(f.weightKg || 1)} kg)</dt><dd>₹{weightFee}</dd>
              <dt>Slot fee</dt><dd>₹{slotFee}</dd>
              <dt className="tot">Total</dt><dd className="tot">₹{total}</dd>
            </dl>
            <button className="primary block" disabled={busy}>{busy ? "Booking…" : `Confirm booking · ₹${total}`}</button>
            <small className="muted">Free changes until the driver sets out.</small>
          </aside>
        </form>
      )}
    </div>
  );
}
