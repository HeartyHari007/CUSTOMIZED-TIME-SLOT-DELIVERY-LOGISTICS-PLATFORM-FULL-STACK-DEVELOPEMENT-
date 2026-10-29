import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import Status, { Progress, fmtSlot } from "../components/Status.jsx";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [moving, setMoving] = useState(null);
  const [options, setOptions] = useState([]);
  const [msg, setMsg] = useState("");

  const load = () => api.get("/orders").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const startMove = async (o) => {
    setMoving(o._id);
    setOptions((await api.get("/slots", { params: { date: o.slot.date, zone: o.slot.zone } })).data.filter((s) => s._id !== o.slot._id));
  };
  const act = async (fn) => { setMsg(""); try { await fn(); setMoving(null); load(); } catch (e) { setMsg(errMsg(e)); } };

  return (
    <div className="page">
      <div className="page-head"><div><h2>My orders</h2><p className="muted">Track, change or cancel your deliveries.</p></div></div>
      {msg && <p className="err">{msg}</p>}
      {orders.length === 0 && <div className="empty-box">No deliveries yet. Book your first window from the Book tab.</div>}
      {orders.map((o) => (
        <article className="card" key={o._id}>
          <div className="row"><div><strong className="card-title">{o.packageDesc}</strong><div className="muted">Tracking ID <code>{o.trackingId}</code></div></div><Status s={o.status} /></div>
          <Progress status={o.status} />
          <div className="facts">
            <div><small>Delivery window</small><span>{fmtSlot(o.slot)}</span></div>
            <div><small>Drop address</small><span>{o.dropAddress}</span></div>
            <div><small>Driver</small><span>{o.driver ? o.driver.name : "To be assigned"}</span></div>
            <div><small>Total</small><span>₹{o.total}</span></div>
          </div>
          {o.status === "scheduled" && (
            <div className="actions">
              <button onClick={() => startMove(o)}>Change slot</button>
              <button className="danger" onClick={() => act(() => api.put(`/orders/${o._id}/cancel`))}>Cancel order</button>
            </div>
          )}
          {moving === o._id && (
            <div className="grid">
              {options.length === 0 && <p className="empty">No other open slots that day in this area.</p>}
              {options.map((s) => (
                <button key={s._id} className="slot" onClick={() => act(() => api.put(`/orders/${o._id}/reschedule`, { slotId: s._id }))}>
                  <span className="slot-time">{s.startTime}<i> – </i>{s.endTime}</span><span className="slot-zone">{s.capacity - s.booked} left</span>
                </button>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
