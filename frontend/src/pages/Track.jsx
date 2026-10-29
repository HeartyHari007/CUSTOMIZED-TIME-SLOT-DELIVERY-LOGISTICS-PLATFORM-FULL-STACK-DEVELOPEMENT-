import { useState } from "react";
import api, { errMsg } from "../api";
import Status, { Progress, fmtSlot } from "../components/Status.jsx";

export default function Track() {
  const [id, setId] = useState("");
  const [o, setO] = useState(null);
  const [err, setErr] = useState("");
  const go = async (e) => {
    e.preventDefault(); setErr(""); setO(null);
    try { setO((await api.get(`/orders/track/${id.trim()}`)).data); } catch (x) { setErr(errMsg(x)); }
  };
  return (
    <div className="page narrow">
      <div className="page-head"><div><h2>Track a parcel</h2><p className="muted">Enter the tracking ID from your booking.</p></div></div>
      <form className="toolbar" onSubmit={go}>
        <label className="grow">Tracking ID<input required value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. SDXXXXXXXX42" /></label>
        <button className="primary">Track</button>
      </form>
      {err && <p className="err">{err}</p>}
      {o && <article className="card">
        <div className="row"><strong className="card-title">{o.trackingId}</strong><Status s={o.status} /></div>
        <Progress status={o.status} />
        <div className="facts">
          <div><small>Delivery window</small><span>{fmtSlot(o.slot)}</span></div>
          <div><small>Delivering to</small><span>{o.dropAddress}</span></div>
        </div>
      </article>}
    </div>
  );
}
