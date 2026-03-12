import { useState, useEffect, useCallback } from "react";

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8080/api";

const api = {
  // Auth
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()),

  // Users
  signUp: (email, password, nickname) =>
    fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    }).then((r) => r.json()),
  getUser: (userId) => fetch(`${API_BASE}/users/${userId}`).then((r) => r.json()),

  // Memos
  getMemos: () => fetch(`${API_BASE}/memos`).then((r) => r.json()),
  createMemo: (userId, title, content) =>
    fetch(`${API_BASE}/memos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, content }),
    }).then((r) => r.json()),
  updateMemo: (memoId, title, content) =>
    fetch(`${API_BASE}/memos/${memoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    }).then((r) => r.json()),
  deleteMemo: (memoId) =>
    fetch(`${API_BASE}/memos/${memoId}`, { method: "DELETE" }).then((r) => r.json()),

  // Tags
  getTags: () => fetch(`${API_BASE}/tags`).then((r) => r.json()),
  createTag: (name) =>
    fetch(`${API_BASE}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => r.json()),
  getMemoTags: (memoId) => fetch(`${API_BASE}/memos/${memoId}/tags`).then((r) => r.json()),
  addTagToMemo: (memoId, tagId) =>
    fetch(`${API_BASE}/memos/${memoId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    }).then((r) => r.json()),
  removeTagFromMemo: (memoId, tagId) =>
    fetch(`${API_BASE}/memos/${memoId}/tags/${tagId}`, {
      method: "DELETE",
    }).then((r) => r.json()),

  // Schedules
  getSchedules: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/schedules${qs ? "?" + qs : ""}`).then((r) => r.json());
  },
  createSchedule: (payload) =>
    fetch(`${API_BASE}/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
  deleteSchedule: (scheduleId) =>
    fetch(`${API_BASE}/schedules/${scheduleId}`, { method: "DELETE" }).then((r) => r.json()),

  // Todos
  getTodos: (completed) => {
    const qs = completed !== undefined ? `?completed=${completed}` : "";
    return fetch(`${API_BASE}/todos${qs}`).then((r) => r.json());
  },
  createTodo: (scheduleId, content) =>
    fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId, content }),
    }).then((r) => r.json()),
  completeTodo: (todoId) =>
    fetch(`${API_BASE}/todos/${todoId}/complete`, { method: "PATCH" }).then((r) => r.json()),
};

// ─── ICONS (inline SVG) ───────────────────────────────────────────────────────
const Icon = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#FFA500" />
      <path d="M7 10h14M7 14h10M7 18h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Schedule: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Memo: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" />
    </svg>
  ),
  Todo: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,11 12,14 22,4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Tag: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Edit: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
    </svg>
  ),
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
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

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
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
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icon.Close /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FORM COMPONENTS ─────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", borderRadius: 9,
  border: "1.5px solid #ddd", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", color: "#454545",
  background: "#fff", outline: "none",
  transition: "border-color .2s",
};
const labelStyle = { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: ".06em" };
const btnPrimary = {
  background: "#FFA500", color: "#fff", border: "none",
  borderRadius: 9, padding: "11px 22px", fontSize: 14,
  fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  transition: "background .2s, transform .1s",
};
const btnSecondary = {
  background: "transparent", color: "#454545",
  border: "1.5px solid #ccc", borderRadius: 9,
  padding: "10px 20px", fontSize: 14, fontWeight: 600,
  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
};
const btnDanger = {
  background: "transparent", color: "#c0392b", border: "none",
  borderRadius: 7, padding: "6px 8px", cursor: "pointer",
  fontSize: 12, display: "flex", alignItems: "center", gap: 4,
  transition: "background .15s",
};

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin, showToast }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", nickname: "" });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await api.login(form.email, form.password);
        if (res.accessToken) {
          onLogin({ token: res.accessToken, email: form.email });
          showToast("로그인 성공!", "success");
        } else {
          showToast("로그인에 실패했습니다.", "error");
        }
      } else {
        const res = await api.signUp(form.email, form.password, form.nickname);
        if (res.userId) {
          showToast("회원가입 완료! 로그인해주세요.", "success");
          setMode("login");
        } else {
          showToast("회원가입에 실패했습니다.", "error");
        }
      }
    } catch {
      showToast("서버 연결 오류", "error");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F7F7F7",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "48px 44px",
        width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
        border: "1px solid #eee",
      }}>
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <Icon.Logo />
          <span style={{ fontSize: 22, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif", letterSpacing: "-.5px" }}>
            Planner
          </span>
        </div>
        <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif" }}>
          {mode === "login" ? "다시 만나요 👋" : "시작해볼까요 🚀"}
        </h2>
        <p style={{ margin: "0 0 28px", color: "#888", fontSize: 14 }}>
          {mode === "login" ? "계정에 로그인하세요" : "새 계정을 만드세요"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>이메일</label>
            <input style={inputStyle} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>비밀번호</label>
            <input style={inputStyle} type="password" placeholder="••••••••"
              value={form.password} onChange={e => set("password", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          {mode === "signup" && (
            <div>
              <label style={labelStyle}>닉네임</label>
              <input style={inputStyle} type="text" placeholder="닉네임"
                value={form.nickname} onChange={e => set("nickname", e.target.value)} />
            </div>
          )}
        </div>

        <button style={{ ...btnPrimary, width: "100%", marginTop: 24, padding: "13px", fontSize: 15 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
          {mode === "login" ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{ background: "none", border: "none", color: "#FFA500", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {mode === "login" ? "회원가입" : "로그인"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, user, onLogout }) {
  const navItems = [
    { key: "schedule", label: "일정", icon: <Icon.Schedule /> },
    { key: "memo", label: "메모", icon: <Icon.Memo /> },
    { key: "todo", label: "할 일", icon: <Icon.Todo /> },
    { key: "tag", label: "태그", icon: <Icon.Tag /> },
  ];
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
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FFA500", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon.User />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#F7F7F7", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || "사용자"}</div>
          <div style={{ color: "rgba(247,247,247,0.45)", fontSize: 11 }}>플래너</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(item => (
          <button key={item.key} onClick={() => setActive(item.key)} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 14px", borderRadius: 10, border: "none",
            background: active === item.key ? "#FFA500" : "transparent",
            color: active === item.key ? "#fff" : "rgba(247,247,247,0.65)",
            fontSize: 14, fontWeight: active === item.key ? 700 : 500,
            cursor: "pointer", width: "100%", textAlign: "left",
            transition: "all .18s", fontFamily: "'DM Sans', sans-serif",
          }}>
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

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }) {
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

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
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

// ─── SCHEDULE SECTION ─────────────────────────────────────────────────────────
function ScheduleSection({ showToast, user }) {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ mode: "all", date: "", start: "", end: "" });
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let params = {};
      if (filter.mode === "date" && filter.date) params = { date: filter.date };
      else if (filter.mode === "period" && filter.start && filter.end) params = { start: filter.start, end: filter.end };
      const data = await api.getSchedules(params);
      setSchedules(Array.isArray(data) ? data : []);
    } catch { showToast("일정 로드 실패", "error"); }
    setLoading(false);
  }, [filter, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title || !form.startDate || !form.endDate) return showToast("모든 필드를 입력해주세요", "error");
    try {
      const payload = { userId: user?.userId || 1, title: form.title, description: form.description, startDate: form.startDate + ":00", endDate: form.endDate + ":00" };
      await api.createSchedule(payload);
      showToast("일정이 추가되었습니다!", "success");
      setShowModal(false); setForm({ title: "", description: "", startDate: "", endDate: "" }); load();
    } catch { showToast("일정 추가 실패", "error"); }
  };

  const handleDelete = async (id) => {
    try { await api.deleteSchedule(id); showToast("일정 삭제 완료", "success"); load(); }
    catch { showToast("삭제 실패", "error"); }
  };

  const formatDT = (s) => { try { return new Date(s).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return s; } };

  return (
    <div>
      <SectionHeader title="일정 관리" subtitle="나의 일정을 한눈에 확인하세요"
        action={<button style={btnPrimary} onClick={() => setShowModal(true)}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Plus />일정 추가</span></button>} />

      {/* Filter Bar */}
      <Card style={{ marginBottom: 20, padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {[["all", "전체"], ["date", "날짜별"], ["period", "기간별"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(f => ({ ...f, mode: k }))} style={{
              padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
              borderColor: filter.mode === k ? "#FFA500" : "#ddd",
              background: filter.mode === k ? "#FFA500" : "transparent",
              color: filter.mode === k ? "#fff" : "#666",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>{l}</button>
          ))}
          {filter.mode === "date" && <input type="date" style={{ ...inputStyle, width: "auto", padding: "7px 12px" }} value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />}
          {filter.mode === "period" && (
            <>
              <input type="date" style={{ ...inputStyle, width: "auto", padding: "7px 12px" }} value={filter.start} onChange={e => setFilter(f => ({ ...f, start: e.target.value }))} />
              <span style={{ color: "#888" }}>~</span>
              <input type="date" style={{ ...inputStyle, width: "auto", padding: "7px 12px" }} value={filter.end} onChange={e => setFilter(f => ({ ...f, end: e.target.value }))} />
            </>
          )}
          <button onClick={load} style={{ ...btnPrimary, padding: "7px 16px", fontSize: 13 }}>검색</button>
        </div>
      </Card>

      {loading ? <div style={{ textAlign: "center", color: "#888", padding: 40 }}>불러오는 중...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {schedules.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#aaa", padding: 48, fontSize: 15 }}>등록된 일정이 없습니다</div>
          ) : schedules.map(s => (
            <Card key={s.scheduleId}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#454545", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  {s.description && <div style={{ fontSize: 13, color: "#777", marginBottom: 10, lineHeight: 1.5 }}>{s.description}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#aaa", fontSize: 12 }}>
                    <Icon.Clock />
                    <span>{formatDT(s.startDate)}</span>
                    <span>→</span>
                    <span>{formatDT(s.endDate)}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(s.scheduleId)} style={{ ...btnDanger, marginLeft: 8, flexShrink: 0 }}><Icon.Trash /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="새 일정 추가" onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={labelStyle}>제목</label><input style={inputStyle} placeholder="일정 제목" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label style={labelStyle}>설명</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} placeholder="상세 내용 (선택)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={labelStyle}>시작</label><input style={inputStyle} type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><label style={labelStyle}>종료</label><input style={inputStyle} type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
            <button style={btnSecondary} onClick={() => setShowModal(false)}>취소</button>
            <button style={btnPrimary} onClick={handleCreate}>추가하기</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MEMO TAG MODAL ───────────────────────────────────────────────────────────
function MemoTagModal({ memo, allTags, showToast, onClose }) {
  const [memoTags, setMemoTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await api.getMemoTags(memo.memoId);
      setMemoTags(Array.isArray(t) ? t : []);
    } catch { showToast("태그 로드 실패", "error"); }
  }, [memo.memoId, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (tagId) => {
    setLoading(true);
    try {
      await api.addTagToMemo(memo.memoId, tagId);
      showToast("태그 추가 완료!", "success");
      load();
    } catch { showToast("태그 추가 실패", "error"); }
    setLoading(false);
  };

  const handleRemove = async (tagId) => {
    setLoading(true);
    try {
      await api.removeTagFromMemo(memo.memoId, tagId);
      showToast("태그 제거 완료!", "success");
      load();
    } catch { showToast("태그 제거 실패", "error"); }
    setLoading(false);
  };

  const attachedIds = new Set(memoTags.map(t => t.tagId));
  const tagColors = ["#FFF3CD", "#D4EDDA", "#D1ECF1", "#F8D7DA", "#E2D9F3", "#FFEAA7"];

  return (
    <Modal title={`"${memo.title}" 태그 관리`} onClose={onClose}>
      {/* 현재 태그 */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>현재 태그</label>
        {memoTags.length === 0 ? (
          <div style={{ color: "#aaa", fontSize: 13, padding: "10px 0" }}>연결된 태그가 없습니다</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {memoTags.map((t, i) => (
              <span key={t.tagId} style={{
                background: tagColors[i % tagColors.length],
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 20, padding: "5px 10px 5px 14px",
                fontSize: 13, fontWeight: 600, color: "#454545",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ color: "#FFA500" }}>#</span>
                {t.name}
                <button
                  onClick={() => handleRemove(t.tagId)}
                  disabled={loading}
                  style={{
                    background: "rgba(0,0,0,0.08)", border: "none",
                    borderRadius: "50%", width: 18, height: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#666", fontSize: 11, fontWeight: 700,
                    lineHeight: 1, padding: 0, flexShrink: 0,
                  }}
                >✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 추가 가능한 태그 */}
      <div>
        <label style={labelStyle}>태그 추가</label>
        {allTags.filter(t => !attachedIds.has(t.tagId)).length === 0 ? (
          <div style={{ color: "#aaa", fontSize: 13, padding: "10px 0" }}>
            {allTags.length === 0 ? "생성된 태그가 없습니다. 태그 탭에서 먼저 만들어주세요." : "모든 태그가 이미 연결되어 있습니다."}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {allTags.filter(t => !attachedIds.has(t.tagId)).map((t, i) => (
              <button key={t.tagId} onClick={() => handleAdd(t.tagId)} disabled={loading} style={{
                background: "#fff",
                border: "1.5px dashed #ddd",
                borderRadius: 20, padding: "5px 14px",
                fontSize: 13, fontWeight: 600,
                color: "#888",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                opacity: loading ? 0.6 : 1,
                transition: "all .15s",
              }}>
                <span style={{ color: "#ccc" }}>#</span>
                {t.name}
                <span style={{ fontSize: 14, color: "#FFA500", fontWeight: 800 }}>+</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button style={btnPrimary} onClick={onClose}>완료</button>
      </div>
    </Modal>
  );
}

// ─── MEMO SECTION ─────────────────────────────────────────────────────────────
function MemoSection({ showToast, user }) {
  const [memos, setMemos] = useState([]);
  const [tags, setTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMemo, setEditMemo] = useState(null);
  const [tagMemo, setTagMemo] = useState(null); // 태그 관리할 메모
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  // 각 메모의 태그 캐시: { [memoId]: Tag[] }
  const [memoTagsMap, setMemoTagsMap] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([api.getMemos(), api.getTags()]);
      const memoList = Array.isArray(m) ? m : [];
      setMemos(memoList);
      setTags(Array.isArray(t) ? t : []);
      // 모든 메모의 태그를 병렬로 로드
      const tagResults = await Promise.all(
        memoList.map(memo => api.getMemoTags(memo.memoId).catch(() => []))
      );
      const map = {};
      memoList.forEach((memo, i) => { map[memo.memoId] = Array.isArray(tagResults[i]) ? tagResults[i] : []; });
      setMemoTagsMap(map);
    } catch { showToast("메모 로드 실패", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditMemo(null); setForm({ title: "", content: "" }); setShowModal(true); };
  const openEdit = (m) => { setEditMemo(m); setForm({ title: m.title, content: m.content }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title) return showToast("제목을 입력해주세요", "error");
    try {
      if (editMemo) {
        await api.updateMemo(editMemo.memoId, form.title, form.content);
        showToast("메모 수정 완료!", "success");
      } else {
        await api.createMemo(user?.userId || 1, form.title, form.content);
        showToast("메모 추가 완료!", "success");
      }
      setShowModal(false); load();
    } catch { showToast("저장 실패", "error"); }
  };

  const handleDelete = async (id) => {
    try { await api.deleteMemo(id); showToast("메모 삭제 완료", "success"); load(); }
    catch { showToast("삭제 실패", "error"); }
  };

  const formatDate = (s) => { try { return new Date(s).toLocaleDateString("ko-KR"); } catch { return s; } };
  const noteColors = ["#fffbea", "#fff0f0", "#f0f8ff", "#f3fff3", "#fdf0ff"];
  const tagColors = ["#FFF3CD", "#D4EDDA", "#D1ECF1", "#F8D7DA", "#E2D9F3", "#FFEAA7"];

  return (
    <div>
      <SectionHeader title="메모" subtitle="아이디어와 기록을 남겨보세요"
        action={<button style={btnPrimary} onClick={openCreate}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Plus />메모 추가</span></button>} />

      {loading ? <div style={{ textAlign: "center", color: "#888", padding: 40 }}>불러오는 중...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {memos.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#aaa", padding: 48, fontSize: 15 }}>작성된 메모가 없습니다</div>
          ) : memos.map((m, i) => {
            const thisTags = memoTagsMap[m.memoId] || [];
            return (
              <div key={m.memoId} style={{
                background: noteColors[i % noteColors.length],
                borderRadius: 14, padding: "20px 20px 16px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column",
              }}>
                {/* 제목 + 버튼 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#454545", flex: 1, marginRight: 8 }}>{m.title}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(m)} style={{ ...btnDanger, color: "#888" }}><Icon.Edit /></button>
                    <button onClick={() => handleDelete(m.memoId)} style={btnDanger}><Icon.Trash /></button>
                  </div>
                </div>

                {/* 내용 */}
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, flex: 1, marginBottom: 12, whiteSpace: "pre-wrap" }}>
                  {m.content || "내용 없음"}
                </div>

                {/* 태그 목록 */}
                {thisTags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                    {thisTags.map((t, ti) => (
                      <span key={t.tagId} style={{
                        background: tagColors[ti % tagColors.length],
                        borderRadius: 20, padding: "3px 10px",
                        fontSize: 11, fontWeight: 600, color: "#454545",
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <span style={{ color: "#FFA500" }}>#</span>{t.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* 하단: 날짜 + 태그 추가 버튼 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon.Clock />{formatDate(m.createdAt)}
                  </div>
                  <button onClick={() => setTagMemo(m)} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "rgba(255,165,0,0.12)", border: "none",
                    borderRadius: 20, padding: "4px 11px",
                    fontSize: 11, fontWeight: 700, color: "#FFA500",
                    cursor: "pointer",
                  }}>
                    <Icon.Tag /> 태그
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 메모 생성/수정 모달 */}
      {showModal && (
        <Modal title={editMemo ? "메모 수정" : "새 메모 추가"} onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={labelStyle}>제목</label><input style={inputStyle} placeholder="메모 제목" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label style={labelStyle}>내용</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 120 }} placeholder="메모 내용" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
            <button style={btnSecondary} onClick={() => setShowModal(false)}>취소</button>
            <button style={btnPrimary} onClick={handleSave}>{editMemo ? "수정하기" : "추가하기"}</button>
          </div>
        </Modal>
      )}

      {/* 태그 관리 모달 */}
      {tagMemo && (
        <MemoTagModal
          memo={tagMemo}
          allTags={tags}
          showToast={showToast}
          onClose={() => { setTagMemo(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── TODO SECTION ─────────────────────────────────────────────────────────────
function TodoSection({ showToast }) {
  const [todos, setTodos] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState(null); // null=all, true=done, false=pending
  const [form, setForm] = useState({ scheduleId: "", content: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([api.getTodos(filter ?? undefined), api.getSchedules()]);
      setTodos(Array.isArray(t) ? t : []);
      setSchedules(Array.isArray(s) ? s : []);
    } catch { showToast("할 일 로드 실패", "error"); }
    setLoading(false);
  }, [filter, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.scheduleId || !form.content) return showToast("스케줄과 내용을 입력해주세요", "error");
    try {
      await api.createTodo(Number(form.scheduleId), form.content);
      showToast("할 일 추가 완료!", "success");
      setShowModal(false); setForm({ scheduleId: "", content: "" }); load();
    } catch { showToast("추가 실패", "error"); }
  };

  const handleComplete = async (id) => {
    try { await api.completeTodo(id); showToast("완료 처리!", "success"); load(); }
    catch { showToast("처리 실패", "error"); }
  };

  const done = todos.filter(t => t.completed);
  const pending = todos.filter(t => !t.completed);

  return (
    <div>
      <SectionHeader title="할 일" subtitle="오늘의 할 일을 완료해 보세요!"
        action={<button style={btnPrimary} onClick={() => setShowModal(true)}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Plus />할 일 추가</span></button>} />

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[[null, "전체"], [false, "미완료"], [true, "완료"]].map(([v, l]) => (
          <button key={String(v)} onClick={() => setFilter(v)} style={{
            padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
            borderColor: filter === v ? "#FFA500" : "#ddd",
            background: filter === v ? "#FFA500" : "transparent",
            color: filter === v ? "#fff" : "#666",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>{l}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", color: "#888", padding: 40 }}>불러오는 중...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {todos.length === 0 && <div style={{ textAlign: "center", color: "#aaa", padding: 48, fontSize: 15 }}>할 일이 없습니다</div>}
          {todos.map(t => (
            <Card key={t.todoId} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => !t.completed && handleComplete(t.todoId)} style={{
                width: 26, height: 26, borderRadius: "50%", border: "2px solid",
                borderColor: t.completed ? "#FFA500" : "#ccc",
                background: t.completed ? "#FFA500" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: t.completed ? "default" : "pointer", flexShrink: 0,
                transition: "all .2s",
              }}>
                {t.completed && <span style={{ color: "#fff" }}><Icon.Check /></span>}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: t.completed ? "#aaa" : "#454545", fontWeight: 500, textDecoration: t.completed ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.content}
                </div>
                <div style={{ fontSize: 11, color: "#ccc", marginTop: 2 }}>스케줄 #{t.scheduleId}</div>
              </div>
              {t.completed && <span style={{ fontSize: 11, color: "#FFA500", fontWeight: 700, background: "#fff8e1", padding: "3px 10px", borderRadius: 20 }}>완료</span>}
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="새 할 일 추가" onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>연결할 일정</label>
              <select style={{ ...inputStyle }} value={form.scheduleId} onChange={e => setForm(f => ({ ...f, scheduleId: e.target.value }))}>
                <option value="">일정 선택</option>
                {schedules.map(s => <option key={s.scheduleId} value={s.scheduleId}>{s.title}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>할 일 내용</label>
              <input style={inputStyle} placeholder="할 일을 입력하세요" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleCreate()} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
            <button style={btnSecondary} onClick={() => setShowModal(false)}>취소</button>
            <button style={btnPrimary} onClick={handleCreate}>추가하기</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TAG SECTION ──────────────────────────────────────────────────────────────
function TagSection({ showToast }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const t = await api.getTags(); setTags(Array.isArray(t) ? t : []); }
    catch { showToast("태그 로드 실패", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newTag.trim()) return showToast("태그 이름을 입력해주세요", "error");
    try {
      await api.createTag(newTag.trim());
      showToast("태그 추가 완료!", "success");
      setNewTag(""); load();
    } catch { showToast("태그 추가 실패", "error"); }
  };

  const tagColors = ["#FFF3CD", "#D4EDDA", "#D1ECF1", "#F8D7DA", "#E2D9F3", "#FFEAA7"];

  return (
    <div>
      <SectionHeader title="태그 관리" subtitle="메모에 태그를 달아 분류하세요" />

      <Card style={{ marginBottom: 24 }}>
        <label style={labelStyle}>새 태그 만들기</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="태그 이름 입력" value={newTag}
            onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} />
          <button style={{ ...btnPrimary, padding: "10px 20px", whiteSpace: "nowrap" }} onClick={handleCreate}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Plus />추가</span>
          </button>
        </div>
      </Card>

      {loading ? <div style={{ textAlign: "center", color: "#888", padding: 40 }}>불러오는 중...</div> : (
        <div>
          <div style={{ marginBottom: 16, fontSize: 13, color: "#888", fontWeight: 600 }}>전체 태그 {tags.length}개</div>
          {tags.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: 48, fontSize: 15 }}>생성된 태그가 없습니다</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {tags.map((t, i) => (
                <div key={t.tagId} style={{
                  background: tagColors[i % tagColors.length],
                  border: "1px solid rgba(0,0,0,0.07)",
                  borderRadius: 30, padding: "8px 18px",
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 13, fontWeight: 600, color: "#454545",
                }}>
                  <span style={{ color: "#FFA500", fontSize: 16 }}>#</span>
                  {t.name}
                  <span style={{ fontSize: 11, color: "#aaa" }}>ID: {t.tagId}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
function Dashboard({ user }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif" }}>
          안녕하세요 👋
        </h1>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>오늘도 계획적인 하루를 보내세요</p>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("schedule");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  if (!user) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
          @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
          textarea { resize: vertical; }
          input:focus, textarea:focus, select:focus { border-color: #FFA500 !important; box-shadow: 0 0 0 3px rgba(255,165,0,0.12); }
          button:active { transform: scale(0.97); }
          select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: calc(100% - 12px) center; padding-right: 36px !important; }
        `}</style>
        <AuthPage onLogin={handleLogin} showToast={showToast} />
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  const sections = { schedule: ScheduleSection, memo: MemoSection, todo: TodoSection, tag: TagSection };
  const ActiveSection = sections[active];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F7F7F7; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        textarea { resize: vertical; }
        input:focus, textarea:focus, select:focus { border-color: #FFA500 !important; box-shadow: 0 0 0 3px rgba(255,165,0,0.12); }
        button:hover { opacity: .88; }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: calc(100% - 12px) center; padding-right: 36px !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar active={active} setActive={setActive} user={user} onLogout={handleLogout} />
        <main style={{ flex: 1, padding: "40px 44px", overflowY: "auto", background: "#F7F7F7", minHeight: "100vh" }}>
          <Dashboard user={user} />
          <ActiveSection showToast={showToast} user={user} />
        </main>
      </div>

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}