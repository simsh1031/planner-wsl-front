import type { ReactNode } from "react";
import { Icon } from "../icons";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(30,30,30,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#F7F7F7", borderRadius: 16, padding: "32px 36px",
        minWidth: 420, maxWidth: 520, width: "90%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        animation: "fadeIn .2s ease",
        fontFamily: "'DM Sans', sans-serif",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#454545", fontFamily: "'Playfair Display', serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}>
            <Icon.Close />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
