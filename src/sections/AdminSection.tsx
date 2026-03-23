import { useEffect, useState } from "react";
import { api } from "../api";
import { inputStyle, labelStyle, btnPrimary } from "../styles/common";

interface UserRow {
  userId: number;
  email: string;
  nickname: string;
  role: string;
}

interface AdminSectionProps {
  showToast: (message: string, type?: "success" | "error") => void;
}

export default function AdminSection({ showToast }: AdminSectionProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 선택된 유저 & 편집 모달
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ nickname: "", newPassword: "" });
  const [editLoading, setEditLoading] = useState(false);

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 검색
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAllUsers();
      if (Array.isArray(data)) setUsers(data);
    } catch {
      showToast("유저 목록을 불러오지 못했습니다.", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (u: UserRow) => {
    setSelected(u);
    setEditForm({ nickname: u.nickname, newPassword: "" });
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setEditLoading(true);
    try {
      const payload: { nickname?: string; newPassword?: string } = {};
      if (editForm.nickname && editForm.nickname !== selected.nickname)
        payload.nickname = editForm.nickname;
      if (editForm.newPassword)
        payload.newPassword = editForm.newPassword;

      if (Object.keys(payload).length === 0) {
        showToast("변경된 내용이 없습니다.", "error");
        setEditLoading(false);
        return;
      }

      const res = await api.admin.updateUser(selected.userId, payload);
      if (res.userId) {
        showToast("수정되었습니다.", "success");
        setSelected(null);
        fetchUsers();
      } else {
        showToast(res.message ?? "수정 실패", "error");
      }
    } catch {
      showToast("서버 연결 오류", "error");
    }
    setEditLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.admin.deleteUser(deleteTarget.userId);
      if (res.message) {
        showToast("삭제되었습니다.", "success");
        setDeleteTarget(null);
        fetchUsers();
      } else {
        showToast(res.message ?? "삭제 실패", "error");
      }
    } catch {
      showToast("서버 연결 오류", "error");
    }
    setDeleteLoading(false);
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.nickname.toLowerCase().includes(search.toLowerCase())
  );

  /* ── 스타일 ── */
  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    padding: "32px 36px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #eee",
    width: "100%",
    maxWidth: 820,
  };

  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: "#aaa",
    letterSpacing: ".04em",
    textTransform: "uppercase",
    borderBottom: "1px solid #f0f0f0",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "13px 14px",
    fontSize: 14,
    color: "#454545",
    borderBottom: "1px solid #f8f8f8",
    verticalAlign: "middle",
  };

  const roleBadge = (role: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: role === "ADMIN" ? "#fff3e0" : "#f0f0f0",
    color: role === "ADMIN" ? "#FFA500" : "#888",
  });

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn .2s ease",
  };

  const modalStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 18,
    padding: "36px 40px",
    width: 420,
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
  };

  return (
    <div style={{ animation: "fadeIn .3s ease", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={cardStyle}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif" }}>
              회원 관리
            </h2>
            <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: 13 }}>
              전체 {users.length}명
            </p>
          </div>
          {/* 검색 */}
          <input
            style={{ ...inputStyle, width: 220, margin: 0 }}
            placeholder="이메일 또는 닉네임 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 테이블 */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#ccc", fontSize: 14 }}>
            불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#ccc", fontSize: 14 }}>
            유저가 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>이메일</th>
                  <th style={thStyle}>닉네임</th>
                  <th style={thStyle}>권한</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.userId} style={{ transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ ...tdStyle, color: "#bbb", fontFamily: "monospace" }}>#{u.userId}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.nickname}</td>
                    <td style={tdStyle}>
                      <span style={roleBadge(u.role)}>{u.role}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => openEdit(u)}
                          style={{
                            padding: "5px 14px", borderRadius: 8, border: "1px solid #FFA500",
                            background: "transparent", color: "#FFA500", fontSize: 12,
                            fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          disabled={u.role === "ADMIN"}
                          style={{
                            padding: "5px 14px", borderRadius: 8, border: "none",
                            background: u.role === "ADMIN" ? "#f0f0f0" : "#ffe0e0",
                            color: u.role === "ADMIN" ? "#ccc" : "#e53e3e",
                            fontSize: 12, fontWeight: 600,
                            cursor: u.role === "ADMIN" ? "not-allowed" : "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 수정 모달 ── */}
      {selected && (
        <div style={overlayStyle} onClick={() => setSelected(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif" }}>
              회원 정보 수정
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#aaa" }}>
              {selected.email}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>닉네임</label>
                <input
                  style={inputStyle}
                  value={editForm.nickname}
                  onChange={(e) => setEditForm((f) => ({ ...f, nickname: e.target.value }))}
                  placeholder="닉네임"
                />
              </div>
              <div>
                <label style={labelStyle}>새 비밀번호 (선택)</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="변경 시에만 입력"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button
                onClick={() => setSelected(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10,
                  border: "1px solid #eee", background: "#fff",
                  color: "#888", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                취소
              </button>
              <button
                onClick={handleUpdate}
                disabled={editLoading}
                style={{ ...btnPrimary, flex: 2, padding: "12px", fontSize: 14 }}
              >
                {editLoading ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {deleteTarget && (
        <div style={overlayStyle} onClick={() => setDeleteTarget(null)}>
          <div style={{ ...modalStyle, width: 380 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#e53e3e", fontFamily: "'Playfair Display', serif" }}>
              회원 삭제
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
              <strong>{deleteTarget.nickname}</strong> ({deleteTarget.email}) 회원을 삭제하면<br />
              모든 데이터가 영구 삭제됩니다. 계속하시겠습니까?
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10,
                  border: "1px solid #eee", background: "#fff",
                  color: "#888", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  flex: 2, padding: "12px", borderRadius: 10, border: "none",
                  background: "#e53e3e", color: "#fff", fontSize: 14,
                  fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {deleteLoading ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}