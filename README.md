# TODO App

React + Express로 만든 간단한 TODO 앱입니다.

**Live Demo**: https://gilmon0121.github.io/claude-code/

## 기능

- 할 일 추가 / 완료 토글 / 삭제
- 남은 할 일 개수 표시

## 기술 스택

- **Frontend**: React (Vite)
- **Backend**: Express (로컬 개발용, JSON 파일 저장)

> GitHub Pages는 정적 파일만 호스팅하므로, 배포된 데모 버전은 백엔드 서버 없이 **브라우저 localStorage**에 데이터를 저장합니다. 로컬에서 실행할 때는 아래 방법대로 Express API 서버와 함께 동작하며 `todo/server/data/todos.json` 파일에 저장됩니다.

## 로컬에서 실행하기

```bash
# 터미널 1 — API 서버 (:4000)
cd todo/server
npm install
npm start

# 터미널 2 — 프론트엔드 (:5173)
cd todo/client
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속.

## 배포

`master` 브랜치의 `todo/client` 변경 사항이 push되면 GitHub Actions(`.github/workflows/deploy-pages.yml`)가 자동으로 빌드 후 GitHub Pages에 배포합니다.
