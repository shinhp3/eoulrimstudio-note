# 어울림스튜디오 메모장 - Cloudflare 설정 가이드

## 구조
- **Cloudflare Pages**: `index.html` 호스팅 (무료)
- **Cloudflare Workers**: API 서버 역할 (무료)
- **Cloudflare KV**: 메모 데이터 저장 (무료)

---

## 1단계: KV 네임스페이스 만들기

```bash
# wrangler 설치 (없으면)
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# KV 네임스페이스 생성
wrangler kv:namespace create NOTES_KV
```

출력된 `id` 값을 복사해서 `wrangler.toml`의 `id` 자리에 넣으세요:
```toml
[[kv_namespaces]]
binding = "NOTES_KV"
id = "여기에_붙여넣기"
```

---

## 2단계: 비밀번호 설정

`worker.js` 파일 상단:
```javascript
const TEAM_PASSWORD = "eoulrim2024"; // ← 원하는 비밀번호로 변경
```

---

## 3단계: Worker 배포

```bash
wrangler deploy
```

배포 완료 후 출력되는 URL 확인:
```
https://eoulrimstudio-note-api.YOUR_SUBDOMAIN.workers.dev
```

---

## 4단계: index.html에 Worker URL 입력

`index.html` 파일에서:
```javascript
const WORKER_URL = "https://eoulrimstudio-note-api.YOUR_SUBDOMAIN.workers.dev";
```
위 부분을 실제 Worker URL로 교체하세요.

---

## 5단계: Cloudflare Pages 배포

### 방법 A - GitHub 연동 (권장)
1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. **Pages** → **Connect to Git**
3. 이 GitHub 레포 선택
4. Build 설정:
   - Framework preset: `None`
   - Build command: (비워두기)
   - Build output directory: `/`
5. **Save and Deploy**

### 방법 B - 직접 업로드
```bash
# wrangler로 Pages 배포
wrangler pages deploy . --project-name eoulrimstudio-note
```

---

## 사용 방법

- **입장**: 이름 + 팀 비밀번호
- **새 메모**: `+` 버튼
- **편집**: 클릭 후 작성 (1초 후 자동 저장)
- **동기화**: 4초마다 자동으로 다른 팀원 변경사항 반영

## 팀원 공유 정보

- URL: Cloudflare Pages 배포 후 나오는 주소
- 비밀번호: 설정한 팀 비밀번호
