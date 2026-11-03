import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import Status, { fmtSlot } from "../components/Status.jsx";

const blank = { date: "", startTime: "10:00", endTime: "12:00", zone: "", capacity: 6, fee: 0 };

export default function Admin() {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [slots, setSlots] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({ byStatus: [], revenue: 0 });
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState("");

  const load = () => {
    api.get("/orders").then((r) => setOrders(r.data));
    api.get("/slots").then((r) => setSlots(r.data));
    api.get("/orders/stats/summary").then((r) => setStats(r.data));
  };
  useEffect(() => { load(); api.get("/users/drivers").then((r) => setDrivers(r.data)); }, []);

  const count = (s) => stats.byStatus.find((x) => x._id === s)?.count || 0;
  const run = async (fn) => { setMsg(""); try { await fn(); load(); } catch (e) { setMsg(errMsg(e)); } };
  const addSlot = (e) => { e.preventDefault(); run(() => api.post("/slots", { ...f, capacity: +f.capacity, fee: +f.fee })); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="page">
      <div className="page-head"><div><h2>Dispatch</h2><p className="muted">Slots, orders and drivers in one place.</p></div></div>
      <div className="stats">
        <div><b>{count("scheduled")}</b>Scheduled</div>
        <div><b>{count("out_for_delivery")}</b>On the road</div>
        <div><b>{count("delivered")}</b>Delivered</div>
        <div><b>₹{stats.revenue}</b>Revenue</div>
      </div>
      <div className="tabs">
        <button className={tab === "orders" ? "on" : ""} onClick={() => setTab("orders")}>Orders</button>
        <button className={tab === "slots" ? "on" : ""} onClick={() => setTab("slots")}>Time slots</button>
      </div>
      {msg && <p className="err">{msg}</p>}

      {tab === "orders" && orders.map((o) => (
        <article className="card" key={o._id}>
          <div className="row"><strong>{o.trackingId} · {o.packageDesc}</strong><Status s={o.status} /></div>
          <p>{fmtSlot(o.slot)}</p>
          <p className="muted">{o.customer.name} → {o.dropAddress}</p>
          {["scheduled", "out_for_delivery"].includes(o.status) && (
            <div className="actions">
              <select value={o.driver?._id || ""} onChange={(e) => run(() => api.put(`/orders/${o._id}/assign`, { driverId: e.target.value }))}>
                <option value="" disabled>Assign driver</option>
                {drivers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              {o.status === "scheduled" && <button className="danger" onClick={() => run(() => api.put(`/orders/${o._id}/cancel`))}>Cancel</button>}
            </div>
          )}
        </article>
      ))}

      {tab === "slots" && <>
        <form className="panel wide inline" onSubmit={addSlot}>
          <label>Date<input type="date" required value={f.date} onChange={set("date")} /></label>
          <label>From<input type="time" required value={f.startTime} onChange={set("startTime")} /></label>
          <label>To<input type="time" required value={f.endTime} onChange={set("endTime")} /></label>
          <label>Area<input required value={f.zone} onChange={set("zone")} /></label>
          <label>Parcels it can hold<input type="number" min="1" required value={f.capacity} onChange={set("capacity")} /></label>
          <label>Extra fee (₹)<input type="number" min="0" value={f.fee} onChange={set("fee")} /></label>
          <button className="primary">Add slot</button>
        </form>
        <table>
          <thead><tr><th>Date</th><th>Window</th><th>Area</th><th>Booked</th><th>Fee</th><th></th></tr></thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s._id}>
                <td>{s.date}</td><td>{s.startTime} – {s.endTime}</td><td>{s.zone}</td>
                <td>{s.booked}/{s.capacity}</td><td>₹{s.fee}</td>
                <td><button className="danger" onClick={() => run(() => api.delete(`/slots/${s._id}`))}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </>}
    </div>
  );
}
