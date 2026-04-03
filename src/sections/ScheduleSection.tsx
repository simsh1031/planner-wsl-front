import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { Card, SectionHeader } from "../components/common";
import Modal from "../components/common/Modal";
import { Icon } from "../components/icons";
import { inputStyle, labelStyle, btnPrimary, btnSecondary, btnDanger } from "../styles/common";
import type { Schedule, User } from "../types";

interface ScheduleSectionProps {
  showToast: (message: string, type?: "success" | "error") => void;
  user: User | null;
}

const formatDT = (s: string) => {
  try { return new Date(s).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return s; }
};

export default function ScheduleSection({ showToast, user }: ScheduleSectionProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [filter, setFilter] = useState({ mode: "all", date: "", start: "", end: "" });
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let params: Record<string, string> = {};
      if (filter.mode === "date" && filter.date) params = { date: filter.date };
      else if (filter.mode === "period" && filter.start && filter.end) params = { start: filter.start, end: filter.end };
      const data = await api.getSchedules(params);
      setSchedules(Array.isArray(data) ? data : []);
    } catch { showToast("일정 로드 실패", "error"); }
    setLoading(false);
  }, [filter, showToast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditSchedule(null);
    setForm({ title: "", description: "", startDate: "", endDate: "" });
    setShowModal(true);
  };

  const openEdit = (s: Schedule) => {
    setEditSchedule(s);
    // datetime-local input은 "YYYY-MM-DDTHH:mm" 형식 필요
    const toLocal = (dt: string) => dt.slice(0, 16);
    setForm({ title: s.title, description: s.description ?? "", startDate: toLocal(s.startDate), endDate: toLocal(s.endDate) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) return showToast("모든 필드를 입력해주세요", "error");
    try {
      if (editSchedule) {
        await api.updateSchedule(editSchedule.scheduleId, {
          title: form.title,
          description: form.description || undefined,
          startDate: form.startDate + ":00",
          endDate: form.endDate + ":00",
        });
        showToast("일정이 수정되었습니다!", "success");
      } else {
        await api.createSchedule({ userId: user?.userId ?? 1, title: form.title, description: form.description, startDate: form.startDate + ":00", endDate: form.endDate + ":00" });
        showToast("일정이 추가되었습니다!", "success");
      }
      setShowModal(false);
      setForm({ title: "", description: "", startDate: "", endDate: "" });
      load();
    } catch { showToast(editSchedule ? "수정 실패" : "추가 실패", "error"); }
  };

  const handleDelete = async (id: number) => {
    try { await api.deleteSchedule(id); showToast("일정 삭제 완료", "success"); load(); }
    catch { showToast("삭제 실패", "error"); }
  };

  return (
    <div>
      <SectionHeader title="일정 관리" subtitle="나의 일정을 한눈에 확인하세요"
        action={<button style={btnPrimary} onClick={openCreate}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Plus />일정 추가</span></button>} />

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
                    <Icon.Clock /><span>{formatDT(s.startDate)}</span><span>→</span><span>{formatDT(s.endDate)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, marginLeft: 8, flexShrink: 0 }}>
                  <button onClick={() => openEdit(s)} style={{ ...btnDanger, color: "#888" }}><Icon.Edit /></button>
                  <button onClick={() => handleDelete(s.scheduleId)} style={btnDanger}><Icon.Trash /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editSchedule ? "일정 수정" : "새 일정 추가"} onClose={() => setShowModal(false)}>
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
            <button style={btnPrimary} onClick={handleSave}>{editSchedule ? "수정하기" : "추가하기"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
