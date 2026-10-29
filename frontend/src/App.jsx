import { useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink, Link } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Logo from "./components/Logo.jsx";
import Login from "./pages/Login.jsx";
import Book from "./pages/Book.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Track from "./pages/Track.jsx";
import Admin from "./pages/Admin.jsx";
import Driver from "./pages/Driver.jsx";

function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}
const daysLeft = () => {
  try { const t = localStorage.getItem("token"); const exp = JSON.parse(atob(t.split(".")[1])).exp * 1000; return Math.max(0, Math.ceil((exp - Date.now()) / 864e5)); }
  catch { return null; }
};
function SecurityBar({ user }) {
  const [left, setLeft] = useState("--");
  useEffect(() => {
    try {
      const p = JSON.parse(atob(localStorage.getItem("token").split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      const ms = p.exp * 1000 - Date.now();
      setLeft(`${Math.floor(ms / 864e5)}d ${Math.floor((ms % 864e5) / 36e5)}h`);
    } catch { setLeft("--"); }
  }, [user]);
  return (
    <div className="secbar"><div className="secbar-in">
      <span><i className="pulse" />SECURE SESSION</span>
      <span>AUTH: JWT (HS256)</span>
      <span>ACCESS LEVEL: {user.role.toUpperCase()}</span>
      <span>TOKEN EXPIRES: {left}</span>
      <span>PASSWORDS: BCRYPT</span>
    </div></div>
  );
}
const home = (u) => (!u ? "/login" : u.role === "admin" ? "/admin" : u.role === "driver" ? "/driver" : "/book");

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="bar">
        <div className="bar-in">
          <Link to="/" className="brand"><Logo /> SlotDrop</Link>
          <nav>
            <NavLink to="/track">Track parcel</NavLink>
            {user?.role === "customer" && <><NavLink to="/book">Book</NavLink><NavLink to="/orders">My orders</NavLink></>}
            {user?.role === "driver" && <NavLink to="/driver">My runs</NavLink>}
            {user?.role === "admin" && <NavLink to="/admin">Dispatch</NavLink>}
            {user ? (
              <div className="who">
                <span className="session" title="Signed JWT session">JWT · {daysLeft()}d</span>
                <span className="avatar">{user.name[0]}</span>
                <span className="who-text"><b>{user.name}</b><small>{user.role}</small></span>
                <button className="ghost" onClick={logout}>Log out</button>
              </div>
            ) : <NavLink to="/login">Log in</NavLink>}
          </nav>
        </div>
      </header>
      {user && <SecurityBar user={user} />}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to={home(user)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/track" element={<Track />} />
          <Route path="/book" element={<Guard roles={["customer"]}><Book /></Guard>} />
          <Route path="/orders" element={<Guard roles={["customer"]}><MyOrders /></Guard>} />
          <Route path="/driver" element={<Guard roles={["driver"]}><Driver /></Guard>} />
          <Route path="/admin" element={<Guard roles={["admin"]}><Admin /></Guard>} />
        </Routes>
      </main>
      <footer className="foot">© 2026 SlotDrop · Passwords hashed with bcrypt · JWT sessions · Role-based access</footer>
    </>
  );
}
