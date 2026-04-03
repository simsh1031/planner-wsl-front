import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { Card, SectionHeader } from "../components/common";
import Modal from "../components/common/Modal";
import { Icon } from "../components/icons";
import { inputStyle, labelStyle, btnPrimary, btnSecondary } from "../styles/common";
import type { Todo, Schedule } from "../types";

interface TodoSectionProps {
  showToast: (message: string, type?: "success" | "error") => void;
}

export default function TodoSection({ showToast }: TodoSectionProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<boolean | null>(null);
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

  const handleComplete = async (id: number) => {
    try { await api.completeTodo(id); showToast("완료 처리!", "success"); load(); }
    catch { showToast("처리 실패", "error"); }
  };

  return (
    <div>
      <SectionHeader title="할 일" subtitle="오늘의 할 일을 완료해 보세요!"
        action={<button style={btnPrimary} onClick={() => setShowModal(true)}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Plus />할 일 추가</span></button>} />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {([[null, "전체"], [false, "미완료"], [true, "완료"]] as const).map(([v, l]) => (
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
                cursor: t.completed ? "default" : "pointer", flexShrink: 0, transition: "all .2s",
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
              <input style={inputStyle} placeholder="할 일을 입력하세요" value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()} />
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
