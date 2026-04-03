import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { SectionHeader } from "../components/common";
import Modal from "../components/common/Modal";
import { Icon } from "../components/icons";
import { inputStyle, labelStyle, btnPrimary, btnSecondary, btnDanger, TAG_COLORS } from "../styles/common";
import MemoTagModal from "../modals/MemoTagModal";
import type { Memo, Tag, User } from "../types";

interface MemoSectionProps {
  showToast: (message: string, type?: "success" | "error") => void;
  user: User | null;
}

const NOTE_COLORS = ["#fffbea", "#fff0f0", "#f0f8ff", "#f3fff3", "#fdf0ff"];

const formatDate = (s: string) => {
  try { return new Date(s).toLocaleDateString("ko-KR"); } catch { return s; }
};

export default function MemoSection({ showToast, user }: MemoSectionProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMemo, setEditMemo] = useState<Memo | null>(null);
  const [tagMemo, setTagMemo] = useState<Memo | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [memoTagsMap, setMemoTagsMap] = useState<Record<number, Tag[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([api.getMemos(), api.getTags()]);
      const memoList: Memo[] = Array.isArray(m) ? m : [];
      setMemos(memoList);
      setTags(Array.isArray(t) ? t : []);
      const tagResults = await Promise.all(memoList.map(memo => api.getMemoTags(memo.memoId).catch(() => [])));
      const map: Record<number, Tag[]> = {};
      memoList.forEach((memo, i) => { map[memo.memoId] = Array.isArray(tagResults[i]) ? tagResults[i] : []; });
      setMemoTagsMap(map);
    } catch { showToast("메모 로드 실패", "error"); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditMemo(null); setForm({ title: "", content: "" }); setShowModal(true); };
  const openEdit = (m: Memo) => { setEditMemo(m); setForm({ title: m.title, content: m.content }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title) return showToast("제목을 입력해주세요", "error");
    try {
      if (editMemo) {
        await api.updateMemo(editMemo.memoId, form.title, form.content);
        showToast("메모 수정 완료!", "success");
      } else {
        await api.createMemo(user?.userId ?? 1, form.title, form.content);
        showToast("메모 추가 완료!", "success");
      }
      setShowModal(false); load();
    } catch { showToast("저장 실패", "error"); }
  };

  const handleDelete = async (id: number) => {
    try { await api.deleteMemo(id); showToast("메모 삭제 완료", "success"); load(); }
    catch { showToast("삭제 실패", "error"); }
  };

  return (
    <div>
      <SectionHeader title="메모" subtitle="아이디어와 기록을 남겨보세요"
        action={<button style={btnPrimary} onClick={openCreate}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Plus />메모 추가</span></button>} />

      {loading ? <div style={{ textAlign: "center", color: "#888", padding: 40 }}>불러오는 중...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {memos.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#aaa", padding: 48, fontSize: 15 }}>작성된 메모가 없습니다</div>
          ) : memos.map((m, i) => {
            const thisTags = memoTagsMap[m.memoId] ?? [];
            return (
              <div key={m.memoId} style={{
                background: NOTE_COLORS[i % NOTE_COLORS.length],
                borderRadius: 14, padding: "20px 20px 16px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#454545", flex: 1, marginRight: 8 }}>{m.title}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(m)} style={{ ...btnDanger, color: "#888" }}><Icon.Edit /></button>
                    <button onClick={() => handleDelete(m.memoId)} style={btnDanger}><Icon.Trash /></button>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, flex: 1, marginBottom: 12, whiteSpace: "pre-wrap" }}>
                  {m.content || "내용 없음"}
                </div>
                {thisTags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                    {thisTags.map((t, ti) => (
                      <span key={t.tagId} style={{
                        background: TAG_COLORS[ti % TAG_COLORS.length],
                        borderRadius: 20, padding: "3px 10px",
                        fontSize: 11, fontWeight: 600, color: "#454545",
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <span style={{ color: "#FFA500" }}>#</span>{t.name}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon.Clock />{formatDate(m.createdAt)}
                  </div>
                  <button onClick={() => setTagMemo(m)} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "rgba(255,165,0,0.12)", border: "none",
                    borderRadius: 20, padding: "4px 11px",
                    fontSize: 11, fontWeight: 700, color: "#FFA500", cursor: "pointer",
                  }}>
                    <Icon.Tag /> 태그
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {tagMemo && (
        <MemoTagModal memo={tagMemo} allTags={tags} showToast={showToast}
          onClose={() => { setTagMemo(null); load(); }} />
      )}
    </div>
  );
}
