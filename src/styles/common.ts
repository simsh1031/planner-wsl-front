import type { CSSProperties } from "react";

export const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", borderRadius: 9,
  border: "1.5px solid #ddd", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", color: "#454545",
  background: "#fff", outline: "none",
  transition: "border-color .2s",
};

export const labelStyle: CSSProperties = {
  display: "block", marginBottom: 6, fontSize: 12,
  fontWeight: 600, color: "#666", textTransform: "uppercase",
  letterSpacing: ".06em",
};

export const btnPrimary: CSSProperties = {
  background: "#FFA500", color: "#fff", border: "none",
  borderRadius: 9, padding: "11px 22px", fontSize: 14,
  fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  transition: "background .2s, transform .1s",
};

export const btnSecondary: CSSProperties = {
  background: "transparent", color: "#454545",
  border: "1.5px solid #ccc", borderRadius: 9,
  padding: "10px 20px", fontSize: 14, fontWeight: 600,
  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
};

export const btnDanger: CSSProperties = {
  background: "transparent", color: "#c0392b", border: "none",
  borderRadius: 7, padding: "6px 8px", cursor: "pointer",
  fontSize: 12, display: "flex", alignItems: "center", gap: 4,
  transition: "background .15s",
};

export const TAG_COLORS = ["#FFF3CD", "#D4EDDA", "#D1ECF1", "#F8D7DA", "#E2D9F3", "#FFEAA7"];