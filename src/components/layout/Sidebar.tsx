import { Icon } from "../icons";
import type { User } from "../../types";

// 일반 유저 nav
type UserNavKey = "schedule" | "memo" | "todo" | "tag" | "mypage";
// 관리자 nav
type AdminNavKey = "adminUsers";
// 통합 타입
export type NavKey = UserNavKey | AdminNavKey;

interface SidebarProps {
  active: NavKey;
  setActive: (key: NavKey) => void;
  user: User | null;
  onLogout: () => void;
}

const USER_NAV_ITEMS: { key: UserNavKey; label: string; icon: JSX.Element }[] = [
  { key: "schedule",  label: "일정",       icon: <Icon.Schedule /> },
  { key: "memo",      label: "메모",       icon: <Icon.Memo />     },
  { key: "todo",      label: "할 일",      icon: <Icon.Todo />     },
  { key: "tag",       label: "태그",       icon: <Icon.Tag />      },
  { key: "mypage",    label: "마이페이지", icon: <Icon.MyPage />   },
];

const ADMIN_NAV_ITEMS: { key: AdminNavKey; label: string; icon: JSX.Element }[] = [
  { key: "adminUsers", label: "회원정보관리", icon: <Icon.AdminUser /> },
];

export default function Sidebar({ active, setActive, user, onLogout }: SidebarProps) {
  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;

  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "#454545",
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 24px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <Icon.Logo />
        <span style={{ fontSize: 20, fontWeight: 800, color: "#F7F7F7", fontFamily: "'Playfair Display', serif", letterSpacing: "-.5px" }}>
          Planner
        </span>
      </div>

      {/* User badge */}
      <div style={{ margin: "0 16px 24px", background: "rgba(247,247,247,0.08)", borderRadius: 11, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: isAdmin ? "#e53e3e" : "#FFA500",   // 관리자는 빨간색 배지
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon.User />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#F7F7F7", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.nickname ?? user?.email ?? "사용자"}
          </div>
          <div style={{ color: "rgba(247,247,247,0.45)", fontSize: 11 }}>
            {isAdmin ? "관리자" : "플래너"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key as NavKey)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 10, border: "none",
              background: active === item.key ? (isAdmin ? "#e53e3e" : "#FFA500") : "transparent",
              color: active === item.key ? "#fff" : "rgba(247,247,247,0.65)",
              fontSize: 14, fontWeight: active === item.key ? 700 : 500,
              cursor: "pointer", width: "100%", textAlign: "left",
              transition: "all .18s", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ opacity: active === item.key ? 1 : 0.75 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px 12px 24px" }}>
        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          borderRadius: 10, border: "none", background: "transparent",
          color: "rgba(247,247,247,0.5)", fontSize: 13, cursor: "pointer", width: "100%",
          fontFamily: "'DM Sans', sans-serif", transition: "color .15s",
        }}>
          <Icon.Logout /><span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}