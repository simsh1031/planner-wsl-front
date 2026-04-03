import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import Modal from "../components/common/Modal";
import { labelStyle, btnPrimary, TAG_COLORS } from "../styles/common";
import type { Memo, Tag } from "../types";

interface MemoTagModalProps {
  memo: Memo;
  allTags: Tag[];
  showToast: (message: string, type?: "success" | "error") => void;
  onClose: () => void;
}

export default function MemoTagModal({ memo, allTags, showToast, onClose }: MemoTagModalProps) {
  const [memoTags, setMemoTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await api.getMemoTags(memo.memoId);
      setMemoTags(Array.isArray(t) ? t : []);
    } catch { showToast("태그 로드 실패", "error"); }
  }, [memo.memoId, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (tagId: number) => {
    setLoading(true);
    try {
      await api.addTagToMemo(memo.memoId, tagId);
      showToast("태그 추가 완료!", "success");
      load();
    } catch { showToast("태그 추가 실패", "error"); }
    setLoading(false);
  };

  const handleRemove = async (tagId: number) => {
    setLoading(true);
    try {
      await api.removeTagFromMemo(memo.memoId, tagId);
      showToast("태그 제거 완료!", "success");
      load();
    } catch { showToast("태그 제거 실패", "error"); }
    setLoading(false);
  };

  const attachedIds = new Set(memoTags.map(t => t.tagId));

  return (
    <Modal title={`"${memo.title}" 태그 관리`} onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>현재 태그</label>
        {memoTags.length === 0 ? (
          <div style={{ color: "#aaa", fontSize: 13, padding: "10px 0" }}>연결된 태그가 없습니다</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {memoTags.map((t, i) => (
              <span key={t.tagId} style={{
                background: TAG_COLORS[i % TAG_COLORS.length],
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 20, padding: "5px 10px 5px 14px",
                fontSize: 13, fontWeight: 600, color: "#454545",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ color: "#FFA500" }}>#</span>
                {t.name}
                <button onClick={() => handleRemove(t.tagId)} disabled={loading} style={{
                  background: "rgba(0,0,0,0.08)", border: "none", borderRadius: "50%",
                  width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#666", fontSize: 11, fontWeight: 700,
                  lineHeight: 1, padding: 0, flexShrink: 0,
                }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label style={labelStyle}>태그 추가</label>
        {allTags.filter(t => !attachedIds.has(t.tagId)).length === 0 ? (
          <div style={{ color: "#aaa", fontSize: 13, padding: "10px 0" }}>
            {allTags.length === 0 ? "생성된 태그가 없습니다. 태그 탭에서 먼저 만들어주세요." : "모든 태그가 이미 연결되어 있습니다."}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {allTags.filter(t => !attachedIds.has(t.tagId)).map((t) => (
              <button key={t.tagId} onClick={() => handleAdd(t.tagId)} disabled={loading} style={{
                background: "#fff", border: "1.5px dashed #ddd", borderRadius: 20, padding: "5px 14px",
                fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                opacity: loading ? 0.6 : 1, transition: "all .15s",
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
