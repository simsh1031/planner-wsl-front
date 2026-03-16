import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ children, style = {} }: CardProps) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "20px 22px",
      border: "1px solid #eee", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif", letterSpacing: "-.5px" }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
