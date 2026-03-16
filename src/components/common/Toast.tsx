import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#c0392b" : "#454545",
      color: "#F7F7F7", padding: "12px 20px", borderRadius: 10,
      fontSize: 14, fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      borderLeft: `4px solid ${type === "error" ? "#ff6b6b" : "#FFA500"}`,
      display: "flex", alignItems: "center", gap: 10, minWidth: 220,
      animation: "slideUp .25s ease",
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#F7F7F7", cursor: "pointer", opacity: .7 }}>✕</button>
    </div>
  );
}
