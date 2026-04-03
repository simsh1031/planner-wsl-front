import { useState } from "react";
import { api } from "../api";
import { Icon } from "../components/icons";
import { inputStyle, labelStyle, btnPrimary } from "../styles/common";
import type { User } from "../types";

interface AuthPageProps {
  onLogin: (userData: User) => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

export default function AuthPage({ onLogin, showToast }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ email: "", password: "", nickname: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await api.login(form.email, form.password);
        if (res.accessToken) {
          onLogin({ 
            token: res.accessToken, 
            email: form.email, 
            userId: res.userId,
            nickname: res.nickname || "", // 서버에서 주는 값이 없다면 빈 문자열
            role: res.role || "USER"      // 기본값 설정
          });
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
    } catch (err: any) {
      if (err?.status === 401) {
        showToast("이메일 또는 비밀번호가 올바르지 않습니다.", "error");
      } else if (err?.status >= 500) {
        showToast("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
      } else {
        showToast("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.", "error");
      }
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
