import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { Card, SectionHeader } from "../components/common";
import { Icon } from "../components/icons";
import { inputStyle, labelStyle, btnPrimary, TAG_COLORS } from "../styles/common";
import type { Tag } from "../types";

interface TagSectionProps {
  showToast: (message: string, type?: "success" | "error") => void;
}

export default function TagSection({ showToast }: TagSectionProps) {
  const [tags, setTags] = useState<Tag[]>([]);
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
                  background: TAG_COLORS[i % TAG_COLORS.length],
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
