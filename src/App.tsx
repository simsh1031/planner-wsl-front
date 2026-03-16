import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/layout/Sidebar";
import Toast from "./components/common/Toast";
import AuthPage from "./pages/AuthPage";
import ScheduleSection from "./sections/ScheduleSection";
import MemoSection from "./sections/MemoSection";
import TodoSection from "./sections/TodoSection";
import TagSection from "./sections/TagSection";
import type { User, ToastState } from "./types";

type NavKey = "schedule" | "memo" | "todo" | "tag";

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

const SECTIONS: Record<NavKey, React.ComponentType<{ showToast: (m: string, t?: "success" | "error") => void; user: User | null }>> = {
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
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");
    if (token && email && userId) {
      setUser({ token, email, userId: Number(userId) });
    }
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const handleLogin = (userData: User) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("email", userData.email);
    localStorage.setItem("userId", String(userData.userId));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    setUser(null);
  };

  const ActiveSection = SECTIONS[active];

  if (!user) {
    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <AuthPage onLogin={handleLogin} showToast={showToast} />
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar active={active} setActive={setActive} user={user} onLogout={handleLogout} />
        <main style={{ flex: 1, padding: "40px 44px", overflowY: "auto", background: "#F7F7F7", minHeight: "100vh" }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif" }}>
              안녕하세요 👋
            </h1>
            <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>오늘도 계획적인 하루를 보내세요</p>
          </div>
          <ActiveSection showToast={showToast} user={user} />
        </main>
      </div>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
