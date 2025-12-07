import { useState } from "react";
import AdminPanel from "./AdminPanel.jsx";

export default function ProtectedAdmin() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Şifreyi kendine göre değiştir
    if (password === "dugun2026") {
      setAccessGranted(true);
    } else {
      alert("Yanlış şifre!");
    }
  };

  if (!accessGranted) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Admin Panel Girişi</h2>
        <input
          type="password"
          placeholder="Şifreyi gir"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", fontSize: 16 }}
        />
        <button
          onClick={handleLogin}
          style={{ marginLeft: 10, padding: "10px 20px", fontSize: 16 }}
        >
          Giriş
        </button>
      </div>
    );
  }

  return <AdminPanel />;
}
