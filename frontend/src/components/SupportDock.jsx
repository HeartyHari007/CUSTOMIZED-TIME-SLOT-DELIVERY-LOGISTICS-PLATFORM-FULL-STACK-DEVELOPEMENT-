import { useMemo, useState } from "react";

const phone = "+91 7598674010";

export function openMapsLocation(address = "") {
  const target = address || "SlotDrop service center";
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}

function safeText(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function QRCodePreview({ value = "SlotDrop" }) {
  const cells = useMemo(() => {
    const size = 21;
    const matrix = Array.from({ length: size }, () => Array(size).fill(false));

    const toggleFinder = (startRow, startCol) => {
      for (let row = 0; row < 7; row += 1) {
        for (let col = 0; col < 7; col += 1) {
          const edge = row === 0 || row === 6 || col === 0 || col === 6;
          const inner = row >= 2 && row <= 4 && col >= 2 && col <= 4;
          matrix[startRow + row][startCol + col] = edge || inner;
        }
      }
    };

    toggleFinder(0, 0);
    toggleFinder(0, size - 7);
    toggleFinder(size - 7, 0);

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (matrix[row][col]) continue;
        const hash = value.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (row + 1) * (col + 2 + index), 0);
        matrix[row][col] = ((hash + row * 17 + col * 13) % 9) < 3;
      }
    }

    return matrix;
  }, [value]);

  return (
    <div className="qr-code" aria-label={`QR code for ${value}`}>
      {cells.flatMap((row, rowIndex) =>
        row.map((active, colIndex) => (
          <span
            key={`${rowIndex}-${colIndex}`}
            className={active ? "filled" : "empty"}
            style={{ gridColumn: colIndex + 1, gridRow: rowIndex + 1 }}
          />
        ))
      )}
    </div>
  );
}

export function openPrintableReceipt(order) {
  const summary = order || {};
  const trackingId = summary.trackingId || "SD-TRACK-000";
  const packageName = summary.packageDesc || "SlotDrop parcel";
  const total = summary.total || 0;
  const zone = summary.slot?.zone || "City route";
  const slotText = summary.slot ? `${summary.slot.startTime} - ${summary.slot.endTime}` : "Flexible delivery";
  const pickup = summary.pickupAddress || "Pickup station";
  const drop = summary.dropAddress || "Delivery destination";

  const printData = {
    trackingId,
    packageName,
    total,
    zone,
    slotText,
    pickup,
    drop,
    phone,
  };

  const receiptText = [
    "SlotDrop Receipt",
    `Tracking ID: ${printData.trackingId}`,
    `Parcel: ${printData.packageName}`,
    `Delivery window: ${printData.slotText}`,
    `Service zone: ${printData.zone}`,
    `Pickup: ${printData.pickup}`,
    `Drop: ${printData.drop}`,
    `Payment: ₹${printData.total}`,
    `Support: ${printData.phone}`,
    `Total due: ₹${printData.total}`,
  ].join("\n");

  const printWindow = window.open("", "_blank", "width=840,height=960");
  if (printWindow) {
    printWindow.document.write(`<!DOCTYPE html><html><head><title>SlotDrop Receipt</title><style>body{font-family:Arial,sans-serif;padding:32px;background:#f6f8fb;color:#122033}div{white-space:pre-wrap;line-height:1.8}h1{margin:0 0 16px;font-size:28px}p{margin:0 0 8px}</style></head><body><h1>SlotDrop Receipt</h1><div>${safeText(receiptText).replace(/\n/g, "<br/>")}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (_) {
        window.print();
      }
    }, 250);
    return true;
  }

  window.print();
  return true;
}

export function ServiceDock({ order, compact = false }) {
  const [active, setActive] = useState("support");

  const address = order?.dropAddress || "Anna Nagar, Chennai";
  const driverNote = order ? "Driver is 3 min away and approaching the drop zone." : "Nearest drop-off runner is routing to your selected slot.";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const cards = [
    { id: "receipt", label: "Print PDF", action: () => openPrintableReceipt(order) },
    { id: "driver", label: "Driver location", action: () => setActive("driver") },
    { id: "maps", label: "View in maps", action: () => openMapsLocation(address) },
    { id: "support", label: "Customer care", action: () => window.open(`tel:+917598674010`, "_self") },
    { id: "reviews", label: "Reviews", action: () => setActive("reviews") },
    { id: "issues", label: "Problem fixer", action: () => setActive("issues") },
    { id: "more", label: "More services", action: () => setActive("more") }
  ];

  return (
    <div className={`service-dock ${compact ? "compact" : ""}`}>
      <div className="service-header">
        <div>
          <p className="eyebrow">Service hub</p>
          <h3>Everything on one screen</h3>
        </div>
        <div className="signal-pill">Live support</div>
      </div>

      <div className="service-grid">
        {cards.map((card) => (
          <button key={card.id} type="button" className="service-card" onClick={card.action}>
            <span>{card.label}</span>
            <strong>→</strong>
          </button>
        ))}
      </div>

      {active !== "support" && (
        <div className="support-panel">
          {active === "driver" && (
            <>
              <p className="mini-label">Live driver status</p>
              <div className="driver-box">
                <div className="driver-pill">On route</div>
                <div>
                  <strong>Driver: Raman K.</strong>
                  <p>{driverNote}</p>
                </div>
              </div>
            </>
          )}

          {active === "reviews" && (
            <>
              <p className="mini-label">Customer reviews</p>
              <div className="rating-line">
                <span>★★★★★</span>
                <strong>4.9 / 5</strong>
              </div>
              <p>"Friendly driver, on-time delivery, real-time updates."
              </p>
            </>
          )}

          {active === "issues" && (
            <>
              <p className="mini-label">Problem resolver</p>
              <ul className="bullet-list">
                <li>Late arrival notification</li>
                <li>Driver re-route assistance</li>
                <li>Replace or reschedule pickup</li>
              </ul>
            </>
          )}

          {active === "more" && (
            <>
              <p className="mini-label">Extra services</p>
              <ul className="bullet-list">
                <li>Add doorstep protection</li>
                <li>Priority same-day support</li>
                <li>Bulk dispatch and B2B orders</li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
