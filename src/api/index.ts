// const API_BASE = "http://localhost:8080/api";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const authFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });
};

export const api = {
  login: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(async (r) => {
      if (!r.ok) {
        const err = Object.assign(new Error(), { status: r.status });
        throw err;
      }
      return r.json();
    }),

  signUp: (email: string, password: string, nickname: string) =>
    fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    }).then(async (r) => {
      if (!r.ok) {
        const err = Object.assign(new Error(), { status: r.status });
        throw err;
      }
      return r.json();
    }),

  getUser: (userId: number) =>
    authFetch(`${API_BASE}/users/${userId}`).then((r) => r.json()),

  getMemos: () =>
    authFetch(`${API_BASE}/memos`).then((r) => r.json()),
  createMemo: (userId: number, title: string, content: string) =>
    authFetch(`${API_BASE}/memos`, {
      method: "POST",
      body: JSON.stringify({ userId, title, content }),
    }).then((r) => r.json()),
  updateMemo: (memoId: number, title: string, content: string) =>
    authFetch(`${API_BASE}/memos/${memoId}`, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    }).then((r) => r.json()),
  deleteMemo: (memoId: number) =>
    authFetch(`${API_BASE}/memos/${memoId}`, { method: "DELETE" }).then((r) => r.json()),

  getTags: () =>
    authFetch(`${API_BASE}/tags`).then((r) => r.json()),
  createTag: (name: string) =>
    authFetch(`${API_BASE}/tags`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }).then((r) => r.json()),
  getMemoTags: (memoId: number) =>
    authFetch(`${API_BASE}/memos/${memoId}/tags`).then((r) => r.json()),
  addTagToMemo: (memoId: number, tagId: number) =>
    authFetch(`${API_BASE}/memos/${memoId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tagId }),
    }).then((r) => r.json()),
  removeTagFromMemo: (memoId: number, tagId: number) =>
    authFetch(`${API_BASE}/memos/${memoId}/tags/${tagId}`, { method: "DELETE" }).then((r) => r.json()),

  getSchedules: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return authFetch(`${API_BASE}/schedules${qs ? "?" + qs : ""}`).then((r) => r.json());
  },
  createSchedule: (payload: object) =>
    authFetch(`${API_BASE}/schedules`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
  updateSchedule: (scheduleId: number, payload: { title: string; description?: string; startDate: string; endDate: string }) =>
    authFetch(`${API_BASE}/schedules/${scheduleId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
  deleteSchedule: (scheduleId: number) =>
    authFetch(`${API_BASE}/schedules/${scheduleId}`, { method: "DELETE" }).then((r) => r.json()),

  getTodos: (completed?: boolean) => {
    const qs = completed !== undefined ? `?completed=${completed}` : "";
    return authFetch(`${API_BASE}/todos${qs}`).then((r) => r.json());
  },
  createTodo: (scheduleId: number, content: string) =>
    authFetch(`${API_BASE}/todos`, {
      method: "POST",
      body: JSON.stringify({ scheduleId, content }),
    }).then((r) => r.json()),
  completeTodo: (todoId: number) =>
    authFetch(`${API_BASE}/todos/${todoId}/complete`, { method: "PATCH" }).then((r) => r.json()),

  updateUser: (userId: number, payload: { nickname?: string; currentPassword?: string; newPassword?: string }) =>
    authFetch(`${API_BASE}/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).then((r) => r.json()),

  deleteUser: (userId: number, password: string) =>
    authFetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      headers: { "X-Password": password },
    }).then((r) => r.json()),

  // ── 관리자 전용 API ──────────────────────────────────────
  admin: {
    getAllUsers: () =>
      authFetch(`${API_BASE}/admin/users`).then((r) => r.json()),

    getUser: (userId: number) =>
      authFetch(`${API_BASE}/admin/users/${userId}`).then((r) => r.json()),

    updateUser: (userId: number, payload: { nickname?: string; newPassword?: string }) =>
      authFetch(`${API_BASE}/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).then((r) => r.json()),

    deleteUser: (userId: number) =>
      authFetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
      }).then((r) => r.json()),
  },
};