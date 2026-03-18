import { useState } from "react";
import { api } from "../api";
import { inputStyle, labelStyle, btnPrimary } from "../styles/common";
import type { User } from "../types";

interface MyPageSectionProps {
  showToast: (message: string, type?: "success" | "error") => void;
  user: User | null;
  onLogout: () => void;
}

export default function MyPageSection({ showToast, user, onLogout }: MyPageSectionProps) {
  const [tab, setTab] = useState<"edit" | "delete">("edit");

  // 회원정보 수정 폼
  const [editForm, setEditForm] = useState({
    nickname: "",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // 회원탈퇴 폼
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const setEdit = (k: keyof typeof editForm, v: string) =>
    setEditForm((f) => ({ ...f, [k]: v }));

  const handleUpdate = async () => {
    if (!user) return;

    // 변경할 내용이 없는 경우
    if (!editForm.nickname && !editForm.newPassword) {
      showToast("변경할 내용을 입력하세요.", "error");
      return;
    }

    // 비밀번호 변경 시 유효성 검사
    if (editForm.newPassword) {
      if (!editForm.currentPassword) {
        showToast("현재 비밀번호를 입력하세요.", "error");
        return;
      }
      if (editForm.newPassword !== editForm.newPasswordConfirm) {
        showToast("새 비밀번호가 일치하지 않습니다.", "error");
        return;
      }
    }

    setEditLoading(true);
    try {
      const payload: { nickname?: string; currentPassword?: string; newPassword?: string } = {};
      if (editForm.nickname) payload.nickname = editForm.nickname;
      if (editForm.newPassword) {
        payload.currentPassword = editForm.currentPassword;
        payload.newPassword = editForm.newPassword;
      }

      const res = await api.updateUser(user.userId, payload);

      if (res.userId) {
        showToast("정보가 수정되었습니다.", "success");
        setEditForm({ nickname: "", currentPassword: "", newPassword: "", newPasswordConfirm: "" });
      } else {
        showToast(res.message ?? "수정에 실패했습니다.", "error");
      }
    } catch {
      showToast("서버 연결 오류", "error");
    }
    setEditLoading(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!deletePassword) {
      showToast("비밀번호를 입력하세요.", "error");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await api.deleteUser(user.userId, deletePassword);
      if (res.message) {
        showToast("탈퇴가 완료되었습니다.", "success");
        onLogout();
      } else {
        showToast(res.message ?? "탈퇴에 실패했습니다.", "error");
      }
    } catch {
      showToast("서버 연결 오류", "error");
    }
    setDeleteLoading(false);
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    padding: "32px 36px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #eee",
    maxWidth: 700,      // ← 기존 480에서 확장
    width: "100%",      // ← 추가
};

  const tabBtnStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "9px 22px",
    borderRadius: 8,
    border: "none",
    background: isActive ? "#FFA500" : "transparent",
    color: isActive ? "#fff" : "#888",
    fontWeight: isActive ? 700 : 500,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .18s",
  });

  return (
    <div style={{ animation: "fadeIn .3s ease", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* 탭 */}
      <div style={{
        display: "inline-flex", gap: 4, background: "#eee",
        borderRadius: 10, padding: 4, marginBottom: 28,
        width: "100%", maxWidth: 700,   // ← 탭도 카드 너비에 맞춤
      }}>
        <button style={tabBtnStyle(tab === "edit")} onClick={() => setTab("edit")}>
          정보 수정
        </button>
        <button style={tabBtnStyle(tab === "delete")} onClick={() => setTab("delete")}>
          회원 탈퇴
        </button>
      </div>

      {/* 회원정보 수정 */}
      {tab === "edit" && (
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#454545", fontFamily: "'Playfair Display', serif" }}>
            정보 수정
          </h2>
          <p style={{ margin: "0 0 28px", color: "#aaa", fontSize: 13 }}>
            변경할 항목만 입력하세요
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 현재 이메일 (읽기 전용) */}
            <div>
              <label style={labelStyle}>이메일 (변경 불가)</label>
              <input
                style={{ ...inputStyle, background: "#f5f5f5", color: "#aaa", cursor: "not-allowed" }}
                type="email"
                value={user?.email ?? ""}
                readOnly
              />
            </div>

            {/* 닉네임 */}
            <div>
              <label style={labelStyle}>새 닉네임</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="변경할 닉네임"
                value={editForm.nickname}
                onChange={(e) => setEdit("nickname", e.target.value)}
              />
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "4px 0" }} />

            {/* 비밀번호 변경 */}
            <div>
              <label style={labelStyle}>현재 비밀번호</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="현재 비밀번호"
                value={editForm.currentPassword}
                onChange={(e) => setEdit("currentPassword", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>새 비밀번호</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="새 비밀번호"
                value={editForm.newPassword}
                onChange={(e) => setEdit("newPassword", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>새 비밀번호 확인</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="새 비밀번호 확인"
                value={editForm.newPasswordConfirm}
                onChange={(e) => setEdit("newPasswordConfirm", e.target.value)}
              />
            </div>
          </div>

          <button
            style={{ ...btnPrimary, width: "100%", marginTop: 28, padding: "13px", fontSize: 15 }}
            onClick={handleUpdate}
            disabled={editLoading}
          >
            {editLoading ? "저장 중..." : "변경 저장"}
          </button>
        </div>
      )}

      {/* 회원탈퇴 */}
      {tab === "delete" && (
        <div style={{ ...cardStyle, borderColor: "#ffe0e0" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#e53e3e", fontFamily: "'Playfair Display', serif" }}>
            회원 탈퇴
          </h2>
          <p style={{ margin: "0 0 24px", color: "#aaa", fontSize: 13 }}>
            탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>

          {/* 탈퇴 확인 체크박스 */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#e53e3e" }}
            />
            <span style={{ fontSize: 13, color: "#666" }}>
              위 내용을 확인했으며 탈퇴에 동의합니다.
            </span>
          </label>

          <div>
            <label style={labelStyle}>비밀번호 확인</label>
            <input
              style={{ ...inputStyle, borderColor: "#ffcccc" }}
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={!deleteConfirm}
            />
          </div>

          <button
            style={{
              ...btnPrimary,
              width: "100%",
              marginTop: 24,
              padding: "13px",
              fontSize: 15,
              background: deleteConfirm ? "#e53e3e" : "#ccc",
              cursor: deleteConfirm ? "pointer" : "not-allowed",
            }}
            onClick={handleDelete}
            disabled={deleteLoading || !deleteConfirm}
          >
            {deleteLoading ? "처리 중..." : "탈퇴하기"}
          </button>
        </div>
      )}
    </div>
  );
}