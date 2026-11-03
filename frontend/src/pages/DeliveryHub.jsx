import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { openMapsLocation, openPrintableReceipt } from "../components/SupportDock.jsx";
import Status, { Progress, fmtSlot } from "../components/Status.jsx";

const emptyOrder = {
  trackingId: "SD-TRACK-000",
  packageDesc: "Your delivery",
  total: 0,
  dropAddress: "Anna Nagar, Chennai",
  pickupAddress: "Pickup center",
  slot: { startTime: "08:30", endTime: "10:30", zone: "Anna Nagar" }
};

export default function DeliveryHub() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/orders");
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const order = orders[0] || emptyOrder;
  const routeStatus = order.status || "scheduled";

  return (
    <div className="page delivery-page">
      <div className="page-head">
        <div>
          <h2>Delivery hub</h2>
          <p className="muted">Live route, invoice, and support for your active shipment.</p>
        </div>
        <div className="hub-actions">
          <Link to="/book" className="primary-btn">Book new slot</Link>
          <Link to="/orders" className="ghost-link">My orders</Link>
        </div>
      </div>

      {loading ? (
        <div className="empty-box">Loading your delivery details…</div>
      ) : orders.length === 0 ? (
        <div className="empty-box">
          <h3>No active shipment yet</h3>
          <p>Book a delivery slot to start tracking your route, invoice, and support tools.</p>
          <Link to="/book" className="primary-btn">Create a booking</Link>
        </div>
      ) : (
        <>
          <section className="delivery-hero">
            <div className="route-panel">
              <div className="route-header">
                <div>
                  <span className="mini-kicker">Current route</span>
                  <h3>{order.packageDesc}</h3>
                </div>
                <Status s={routeStatus} />
              </div>

              <div className="route-map" aria-label="Delivery route map">
                <div className="map-grid" />
                <div className="route-line route-line-1" />
                <div className="route-line route-line-2" />
                <div className="waypoint pickup-waypoint">
                  <span className="waypoint-core" />
                  <label>Pickup</label>
                </div>
                <div className="waypoint drop-waypoint">
                  <span className="waypoint-core" />
                  <label>Drop</label>
                </div>
                <div className="driver-pin">🚚</div>
                <div className="map-badge">Live</div>
              </div>

              <div className="route-meta">
                <div>
                  <small>Pickup</small>
                  <span>{order.pickupAddress}</span>
                </div>
                <div>
                  <small>Drop</small>
                  <span>{order.dropAddress}</span>
                </div>
              </div>

              <Progress status={routeStatus} />
            </div>

            <aside className="bill-panel">
              <div className="bill-header">
                <div>
                  <span className="mini-kicker">Bill summary</span>
                  <h3>{order.trackingId}</h3>
                </div>
                <div className="price-tag">₹{order.total}</div>
              </div>

              <dl className="bill-lines">
                <div><dt>Base fee</dt><dd>₹50</dd></div>
                <div><dt>Weight</dt><dd>₹{Math.max(0, Number(order.weightKg || 0) * 10)}</dd></div>
                <div><dt>Service zone</dt><dd>₹{order.slot?.fee || 0}</dd></div>
                <div className="total-row"><dt>Total</dt><dd>₹{order.total}</dd></div>
              </dl>

              <div className="bill-actions">
                <button type="button" className="primary" onClick={() => openPrintableReceipt(order)}>Print PDF</button>
                <button type="button" onClick={() => openMapsLocation(order.dropAddress)}>View in maps</button>
                <button type="button" onClick={() => window.open("tel:+917598674010", "_self")}>Customer care</button>
              </div>
            </aside>
          </section>

          <section className="hub-grid">
            <div className="info-card">
              <span className="mini-kicker">Trip details</span>
              <ul className="detail-list">
                <li><strong>Delivery window:</strong> {fmtSlot(order.slot)}</li>
                <li><strong>Driver:</strong> {order.driver ? order.driver.name : "Assigning driver"}</li>
                <li><strong>Vehicle:</strong> {order.driver ? "Mini van • TN-12" : "Pending assignment"}</li>
                <li><strong>Notes:</strong> {order.instructions || "No special instructions"}</li>
              </ul>
            </div>

            <div className="info-card">
              <span className="mini-kicker">Support center</span>
              <ul className="detail-list compact-list">
                <li>Live route tracking</li>
                <li>Driver location checks</li>
                <li>Problem and delay assistance</li>
                <li>Priority customer care: +91 7598674010</li>
              </ul>
            </div>
          </section>

          <section className="status-timeline">
            <div className="timeline-header">
              <div>
                <span className="mini-kicker">Parcel timeline</span>
                <h3>Driver ETA and checkpoints</h3>
              </div>
              <div className="eta-box">ETA: 18 min</div>
            </div>

            <div className="timeline-steps">
              {[
                { label: "Order placed", time: "09:10 AM", done: true },
                { label: "Packed & verified", time: "09:28 AM", done: true },
                { label: "Driver en route", time: "09:42 AM", done: true },
                { label: "Nearest checkpoint", time: "10:05 AM", done: false },
                { label: "Delivered", time: "10:22 AM", done: false }
              ].map((step) => (
                <div key={step.label} className={`timeline-step ${step.done ? "done" : ""}`}>
                  <span className="step-dot" />
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
