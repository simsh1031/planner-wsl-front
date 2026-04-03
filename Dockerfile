# 1단계: 빌드 스테이지
FROM node:20-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치 (캐시 활용을 위해 package.json 먼저 복사)
COPY package*.json ./
RUN npm install

# 전체 소스 코드 복사 및 빌드
COPY . .
RUN npx vite build

# 2단계: 실행 스테이지 (Nginx 사용)
FROM nginx:stable-alpine

# 빌드 스테이지에서 생성된 정적 파일들을 Nginx의 기본 경로로 복사
# Vite의 기본 출력 폴더는 'dist'입니다.
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 80 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]