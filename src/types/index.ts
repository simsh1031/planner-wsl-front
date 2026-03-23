export interface User {
  token: string;
  email: string;
  userId: number;
  nickname: string;
  role: "USER" | "ADMIN";
}

export interface Schedule {
  scheduleId: number;
  userId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface Memo {
  memoId: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface Tag {
  tagId: number;
  name: string;
}

export interface Todo {
  todoId: number;
  scheduleId: number;
  content: string;
  completed: boolean;
}

export interface ToastState {
  id: number;
  message: string;
  type: "success" | "error";
}