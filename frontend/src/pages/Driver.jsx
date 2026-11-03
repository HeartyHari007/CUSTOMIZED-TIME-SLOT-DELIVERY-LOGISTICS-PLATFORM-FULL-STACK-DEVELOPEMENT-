import { useEffect, useState } from "react";
import api from "../api";
import Status, { Progress, fmtSlot } from "../components/Status.jsx";

export default function Driver() {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/orders").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);
  const set = (id, status) => api.put(`/orders/${id}/status`, { status }).then(load);
  const sorted = [...orders].sort((a, b) => (a.slot.date + a.slot.startTime).localeCompare(b.slot.date + b.slot.startTime));

  return (
    <div className="page">
      <div className="page-head"><div><h2>My runs</h2><p className="muted">Your assigned deliveries, earliest first.</p></div></div>
      {sorted.length === 0 && <div className="empty-box">Nothing assigned yet. Dispatch will assign parcels to you.</div>}
      {sorted.map((o) => (
        <article className="card" key={o._id}>
          <div className="row"><strong>{fmtSlot(o.slot)}</strong><Status s={o.status} /></div>
          <p><b>{o.packageDesc}</b> · {o.weightKg} kg</p><Progress status={o.status} />
          <p className="muted">Pick up: {o.pickupAddress}</p>
          <p className="muted">Drop: {o.dropAddress}</p>
          {o.instructions && <p className="muted">Note: {o.instructions}</p>}
          <p className="muted">Customer: {o.customer.name} {o.customer.phone}</p>
          <div className="actions">
            {o.status === "scheduled" && <button className="primary" onClick={() => set(o._id, "out_for_delivery")}>Start delivery</button>}
            {o.status === "out_for_delivery" && <button className="primary" onClick={() => set(o._id, "delivered")}>Mark delivered</button>}
          </div>
        </article>
      ))}
    </div>
  );
}
