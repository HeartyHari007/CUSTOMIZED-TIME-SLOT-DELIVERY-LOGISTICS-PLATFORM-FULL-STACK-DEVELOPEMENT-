import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { errMsg } from "../api";
import Logo from "../components/Logo.jsx";

const DEMO = { Customer: ["customer@slotdrop.com", "customer123"], Driver: ["driver@slotdrop.com", "driver123"], Admin: ["admin@slotdrop.com", "admin123"] };
const SECURITY = [["password", "bcrypt hash"], ["session", "JWT, 7-day expiry"], ["access", "customer | driver | admin"], ["booking", "atomic, no overbooking"], ["tracking", "public view, no personal data"]];

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const u = await (mode === "login" ? login(f) : register(f));
      nav(u.role === "admin" ? "/admin" : u.role === "driver" ? "/driver" : "/book");
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <section className="auth-hero">
        <span className="kicker">Secure delivery console</span>
        <h1>Choose your delivery window. Every step is authenticated.</h1>
        <p>Book a two-hour slot, change it until dispatch, and follow the parcel by tracking ID, with access controlled by your role.</p>
        <div className="term" aria-hidden="true">
          <div className="term-head"><i /><i /><i /><span>slotdrop://security</span></div>
          <div className="term-body">
            {SECURITY.map(([k, v]) => (<p key={k}><b>✓</b> <span>{k}</span> <em>{v}</em></p>))}
            <p className="cursor">$ session --verify</p>
          </div>
        </div>
      </section>

      <section className="auth-form">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-logo"><Logo size={34} /><b>SlotDrop</b></div>
          <h2>{mode === "login" ? "Secure sign in" : "Create your account"}</h2>
          <p className="muted">{mode === "login" ? "Authenticate to book or manage deliveries." : "It takes less than a minute."}</p>
          {mode === "register" && <>
            <label>Full name<input required value={f.name} onChange={set("name")} /></label>
            <label>Phone<input value={f.phone} onChange={set("phone")} /></label>
          </>}
          <label>Email<input type="email" required autoComplete="email" value={f.email} onChange={set("email")} /></label>
          <label>Password<input type="password" required minLength={6} autoComplete="current-password" value={f.password} onChange={set("password")} /></label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="primary block" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in securely" : "Create account"}</button>
          <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}>
            {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
          </button>
          {mode === "login" && (
            <div className="demo">
              <small>Demo accounts</small>
              <div>{Object.entries(DEMO).map(([k, [e, p]]) => (
                <button type="button" key={k} onClick={() => setF({ ...f, email: e, password: p })}>{k}</button>
              ))}</div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
