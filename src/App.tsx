import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/layout/Sidebar";
import Toast from "./components/common/Toast";
import AuthPage from "./pages/AuthPage";
import ScheduleSection from "./sections/ScheduleSection";
import MemoSection from "./sections/MemoSection";
import TodoSection from "./sections/TodoSection";
import TagSection from "./sections/TagSection";
import MyPageSection from "./sections/MyPageSection";
import AdminSection from "./sections/AdminSection";
import type { User, ToastState } from "./types";
import { api } from "./api";

type UserNavKey = "schedule" | "memo" | "todo" | "tag" | "mypage";
type AdminNavKey = "adminUsers";
export type NavKey = UserNavKey | AdminNavKey;

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F7F7F7; }
  @keyframes fadeIn  { from { opacity:0; transform:translateY(8px)  } to { opacity:1; transform:translateY(0) } }
  @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  textarea { resize: vertical; }
  input:focus, textarea:focus, select:focus { border-color: #FFA500 !important; box-shadow: 0 0 0 3px rgba(255,165,0,0.12); }
  button:hover  { opacity: .88; }
  button:active { transform: scale(0.97); }
  select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: calc(100% - 12px) center; padding-right: 36px !important; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
`;

const USER_SECTIONS: Record<
  Exclude<UserNavKey, "mypage">,
  React.ComponentType<{ showToast: (m: string, t?: "success" | "error") => void; user: User | null }>
> = {
  schedule: ScheduleSection,
  memo: MemoSection,
  todo: TodoSection,
  tag: TagSection,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState<NavKey>("schedule");
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const token    = localStorage.getItem("token");
    const email    = localStorage.getItem("email");
    const userId   = localStorage.getItem("userId");
    const nickname = localStorage.getItem("nickname");
    const role     = localStorage.getItem("role") as "USER" | "ADMIN" | null;

    if (token && email && userId) {
      const restoredUser: User = {
        token,
        email,
        userId: Number(userId),
        nickname: nickname ?? "",
        role: role ?? "USER",
      };
      setUser(restoredUser);
      // 관리자라면 기본 탭을 adminUsers로
      if (role === "ADMIN") setActive("adminUsers");
    }
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const handleLogin = async (userData: User) => {
    // 로그인 응답에 nickname/role이 없을 수 있으므로 getUser로 보완
    let fullUser = userData;
    try {
      const detail = await api.getUser(userData.userId);
      if (detail.userId) {
        fullUser = {
          ...userData,
          nickname: detail.nickname ?? "",
          role: detail.role ?? "USER",
        };
      }
    } catch {
      // 실패해도 로그인은 유지
    }

    localStorage.setItem("token",    fullUser.token);
    localStorage.setItem("email",    fullUser.email);
    localStorage.setItem("userId",   String(fullUser.userId));
    localStorage.setItem("nickname", fullUser.nickname);
    localStorage.setItem("role",     fullUser.role);

    setUser(fullUser);
    // 관리자라면 기본 탭을 adminUsers로
    setActive(fullUser.role === "ADMIN" ? "adminUsers" : "schedule");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    localStorage.removeItem("role");
    setUser(null);
    setActive("schedule");
  };

  /* ── 헤더 문구 ── */
  const headerText = user?.role === "ADMIN"
    ? { title: "관리자 페이지 🛡️", sub: "회원 정보를 조회하고 관리하세요" }
    : { title: "안녕하세요 👋",     sub: "오늘도 계획적인 하루를 보내세요" };

  if (!user) {
    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <AuthPage onLogin={handleLogin} showToast={showToast} />
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  const isAdmin = user.role === "ADMIN";

  /* ── 일반 유저 섹션 렌더링 ── */
  const renderUserSection = () => {
    if (active === "mypage") {
      return <MyPageSection showToast={showToast} user={user} onLogout={handleLogout} />;
    }
    const ActiveSection = USER_SECTIONS[active as Exclude<UserNavKey, "mypage">];
    return ActiveSection ? <ActiveSection showToast={showToast} user={user} /> : null;
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar active={active} setActive={setActive} user={user} onLogout={handleLogout} />
        <main style={{ flex: 1, padding: "40px 44px", overflowY: "auto", background: "#F7F7F7", minHeight: "100vh" }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif" }}>
              {headerText.title}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>{headerText.sub}</p>
          </div>

          {/* 관리자 / 일반 유저 분기 */}
          {isAdmin
            ? <AdminSection showToast={showToast} />
            : renderUserSection()
          }
        </main>
      </div>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}