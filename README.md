# Planner - Frontend Service

## 1. 프로젝트 개요

**Planner**는 사용자의 일정, 메모, 할 일, 태그를 통합 관리할 수 있는 웹 기반 대시보드 애플리케이션입니다.

직관적인 UI를 통해 사용자는 다음 기능을 수행할 수 있습니다:
- 📅 **일정 관리**: 일정을 생성, 조회, 수정, 삭제하며, 날짜별/기간별 필터링 가능
- 📝 **메모 관리**: 메모를 작성하고, 태그로 효율적으로 분류
- ✅ **할 일 관리**: 특정 일정에 속한 할 일을 추가하고 완료 상태 관리
- 🏷️ **태그 시스템**: 메모에 태그를 추가하여 검색 및 조회 용이
- 👤 **사용자 관리**: 계정 정보 수정, 비밀번호 변경, 회원탈퇴
- 🔐 **인증 시스템**: JWT 기반의 안전한 로그인/회원가입
- 👨‍💼 **관리자 기능**: 관리자 계정으로 시스템 사용자 관리 (선택적)

---

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| **프레임워크** | React 19.2.0 |
| **언어** | TypeScript 5.9.3 |
| **빌드 도구** | Vite 7.3.1 |
| **스타일링** | Tailwind CSS 4.2.1 |
| **패키지 매니저** | npm |
| **린팅** | ESLint 9.39.1 |
| **플러그인** | @vitejs/plugin-react 5.1.1 |

### 주요 라이브러리
- **react-dom**: 19.2.0 - React UI 렌더링
- **tailwindcss**: 4.2.1 - Utility-first CSS 프레임워크
- **@tailwindcss/vite**: 4.2.1 - Vite용 Tailwind CSS 플러그인

---

## 3. 백엔드와의 연결 방식

### 3.1 API 기반 통신
모든 백엔드 통신은 `src/api/index.ts`에 정의된 함수를 통해 **REST API**로 수행됩니다.

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
```

### 3.2 인증 방식: JWT 토큰
- **저장 위치**: `localStorage`에 다음 정보 저장
  - `token`: JWT 액세스 토큰
  - `email`: 사용자 이메일
  - `userId`: 사용자 ID
  - `nickname`: 사용자 닉네임
  - `role`: 사용자 역할 (USER/ADMIN)

### 3.3 요청 인증 처리
`authFetch` 함수는 모든 API 요청에 자동으로 JWT 토큰을 포함합니다:

```typescript
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
```

### 3.4 제공되는 API 함수

| API 함수 | 역할 |
|---------|------|
| `login()` | 사용자 로그인 (토큰 발급) |
| `signUp()` | 회원가입 |
| `getUser()` | 사용자 정보 조회 |
| `getMemos()`, `createMemo()`, `updateMemo()`, `deleteMemo()` | 메모 관리 |
| `getTags()`, `createTag()` | 태그 조회/생성 |
| `getMemoTags()`, `addTagToMemo()`, `removeTagFromMemo()` | 메모-태그 관리 |
| `getSchedules()`, `createSchedule()`, `updateSchedule()`, `deleteSchedule()` | 일정 관리 |
| `getTodos()`, `createTodo()`, `completeTodo()` | 할 일 관리 |

### 3.5 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하여 백엔드 API 주소를 지정할 수 있습니다:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

기본값은 `http://localhost:8080/api`입니다.

---

## 4. 프론트엔드 자체 처리 기능

### 4.1 인증 및 세션 관리
- **로그인/로그아웃**: 사용자 인증 상태 관리
- **자동 세션 복원**: 페이지 새로고침 시 localStorage에서 사용자 정보 복원
- **역할별 UI 렌더링**: USER와 ADMIN의 다른 네비게이션 및 기능 제공

```typescript
// 로그인 시 사용자 정보 저장
const handleLogin = async (userData: User) => {
  localStorage.setItem("token", userData.token);
  localStorage.setItem("email", userData.email);
  localStorage.setItem("userId", String(userData.userId));
  localStorage.setItem("nickname", userData.nickname);
  localStorage.setItem("role", userData.role);
};
```

### 4.2 상태 관리
- **useState**: 로컬 상태 관리 (폼 입력, 모달 표시 여부, 로딩 상태)
- **useCallback**: 함수 메모이제이션으로 성능 최적화
- **useEffect**: 데이터 로딩 및 부수 효과 처리

### 4.3 UI 컴포넌트

#### 공통 컴포넌트 (`src/components/common/`)
- **Modal**: 입력 폼, 확인 메시지 등 모달 표시
- **Toast**: 성공/에러 알림 메시지 표시
- **Card**: 데이터 리스트 카드
- **SectionHeader**: 섹션 제목 및 액션 버튼 헤더
- **Icons**: 각종 아이콘 컴포넌트 (로고, 닫기, 더하기 등)

#### 레이아웃 (`src/components/layout/`)
- **Sidebar**: 좌측 네비게이션 바 (일정, 메모, 할 일, 태그, 마이페이지)

#### 모달 (`src/modals/`)
- **MemoTagModal**: 메모에 태그 추가 모달

### 4.4 페이지 및 섹션

#### 인증 페이지 (`src/pages/`)
- **AuthPage**: 로그인/회원가입 화면

#### 섹션별 기능 (`src/sections/`)
| 섹션 | 기능 |
|------|------|
| **ScheduleSection** | 일정 CRUD, 날짜/기간별 필터링 |
| **MemoSection** | 메모 CRUD, 메모 목록 표시 |
| **TodoSection** | 할 일 CRUD, 완료/미완료 필터링 |
| **TagSection** | 태그 조회, 새 태그 생성 |
| **MyPageSection** | 사용자 정보 조회, 닉네임/비밀번호 수정, 회원탈퇴 |
| **AdminSection** | 관리자 전용 - 시스템 사용자 관리 |

### 4.5 필터링 및 검색
각 섹션에서는 로컬 상태를 이용한 필터링 기능을 제공합니다:
- **일정**: 날짜별, 기간별 필터링
- **할 일**: 완료/미완료 상태 필터링
- **메모**: 필터링 옵션 (선택적)

```typescript
const [filter, setFilter] = useState({ mode: "all", date: "", start: "", end: "" });
```

### 4.6 폼 입력 및 유효성 검사
- 필드 필수값 검증
- 날짜/시간 입력: HTML5 `datetime-local` input
- 에러 메시지를 Toast로 사용자에게 표시

### 4.7 에러 처리
- HTTP 상태 코드별 에러 처리
  - 401: 인증 실패
  - 500+: 서버 오류
  - 네트워크 오류: 연결 실패 메시지
- Toast 알림으로 사용자에게 친화적 메시지 전달

### 4.8 스타일 및 UX
- **Tailwind CSS**: Utility-first CSS로 빠른 UI 개발
- **전역 스타일**: 폰트, 애니메이션, 포커스 효과, 스크롤바 커스터마이징
- **애니메이션**: 
  - `fadeIn`: 요소 나타날 때
  - `slideUp`: 데이터 로드될 때
- **반응형 디자인**: 다양한 화면 크기 지원

### 4.9 데이터 포맷팅
- **날짜/시간 포맷**: 한국어 로케일로 포맷팅
  ```typescript
  const formatDT = (s: string) => {
    return new Date(s).toLocaleString("ko-KR", { 
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
    });
  };
  ```

---

## 5. 프로젝트 구조

```
Planner-front/
├── src/
│   ├── api/                 # 백엔드 API 함수
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── common/          # Modal, Toast, Card, Header 등
│   │   ├── layout/          # Sidebar 등 레이아웃
│   │   └── icons/           # 아이콘 컴포넌트
│   ├── modals/              # 페이지별 모달 컴포넌트
│   ├── pages/               # 전체 페이지 (AuthPage 등)
│   ├── sections/            # 기능별 섹션 (Schedule, Memo, Todo 등)
│   ├── styles/              # 공유 스타일 변수
│   ├── types/               # TypeScript 타입 정의
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── main.tsx             # 앱 엔트리포인트
│   ├── index.css            # 글로벌 CSS
│   └── App.css              # 앱 스타일
├── public/                  # 정적 파일
├── vite.config.ts           # Vite 설정
├── tsconfig.json            # TypeScript 설정
├── package.json             # 프로젝트 의존성
└── README.md                # 이 파일
```

---

## 6. 빌드 및 실행

### 개발 서버 실행
```bash
npm install
npm run dev
```
개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드
```bash
npm run build
```
빌드된 결과는 `dist/` 디렉토리에 생성됩니다.

### 빌드 결과 미리보기
```bash
npm run preview
```

### 코드 린팅
```bash
npm run lint
```

---

## 7. 백엔드 연동

Planner 프론트엔드가 정상 작동하려면 백엔드 서비스가 필요합니다.

### 백엔드 시작
```bash
cd ../Planner
./gradlew bootRun
```

### API 주소 설정
환경 변수로 백엔드 API 주소를 지정합니다:
```env
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 8. 주요 기능 플로우

### 회원가입 및 로그인
1. AuthPage에서 이메일, 비밀번호, 닉네임 입력
2. 회원가입 → 계정 생성
3. 로그인 → JWT 토큰 발급
4. 토큰을 localStorage에 저장
5. 메인 대시보드 접근

### 일정 관리
1. ScheduleSection에서 "일정 추가" 클릭
2. Modal에서 제목, 설명, 시작일, 종료일 입력
3. 백엔드에 POST 요청
4. 일정 목록 새로고침

### 메모 및 태그
1. MemoSection에서 "메모 추가" 클릭
2. Modal에서 제목, 내용 입력
3. 메모 생성 후 태그 추가 버튼 클릭
4. MemoTagModal에서 태그 선택
5. 메모-태그 연결 완료

---

## 9. 문제 해결

### CORS 오류
백엔드에서 CORS 설정을 확인하세요. 프론트엔드가 localhost:5173에서 실행될 경우, 백엔드에서 허용해야 합니다.

### 토큰 만료
토큰이 만료되면 로그인 페이지로 자동 이동합니다. 다시 로그인하세요.

### API 연결 실패
```env
VITE_API_BASE_URL=http://localhost:8080/api
```
백엔드 주소가 올바른지 확인하세요.

---

## 10. 배포

### Docker로 배포
```dockerfile
# Dockerfile 제공
docker build -t planner-front:latest .
docker run -p 80:80 planner-front:latest
```

---

## 11. 참고

- **Notion**: [프로젝트 문서](https://www.notion.so/wsl-31ae46a3dc7d800eafb6f9b2b94a3130?source=copy_link)

### 정적 호스팅 (Netlify, Vercel 등)
1. `npm run build` 실행
2. `dist/` 폴더를 호스팅 서비스에 배포
3. 환경 변수 설정 (VITE_API_BASE_URL)
