# 어울림스튜디오 메모장 - 설정 가이드

## 1단계: Firebase 프로젝트 만들기

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름 입력 (예: `eoulrimstudio-note`)
4. Google Analytics는 선택 사항 → **프로젝트 만들기**

## 2단계: Realtime Database 활성화

1. 왼쪽 메뉴 → **빌드** → **Realtime Database**
2. **데이터베이스 만들기** 클릭
3. 지역 선택: `asia-southeast1 (Singapore)` 권장
4. 보안 규칙: **테스트 모드로 시작** 선택 후 **사용 설정**

### 보안 규칙 수정 (중요!)

Realtime Database → **규칙** 탭에서 아래로 교체:

```json
{
  "rules": {
    "notes": {
      ".read": true,
      ".write": true
    }
  }
}
```

> **참고**: 비밀번호 인증은 앱 내에서 처리하므로 DB 자체는 열어둡니다.
> 더 강화하려면 Firebase Authentication을 추가하세요.

## 3단계: 앱 설정 가져오기

1. Firebase Console → **프로젝트 설정** (톱니바퀴 아이콘)
2. **일반** 탭 → 스크롤 내려서 **내 앱** 섹션
3. **웹 앱 추가** 클릭 → 앱 닉네임 입력
4. 표시된 `firebaseConfig` 코드 복사

## 4단계: index.html 수정

`index.html` 파일을 열고 아래 부분을 찾아 교체:

```javascript
// ⚠️ Firebase 설정 - 아래 값을 본인의 Firebase 프로젝트 설정으로 교체하세요
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← Firebase에서 복사한 값으로
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

팀 비밀번호도 변경하세요:
```javascript
const TEAM_PASSWORD = "eoulrim2024";  // ← 원하는 비밀번호로 변경
```

## 5단계: GitHub Pages 배포

1. GitHub 레포지토리 → **Settings** → **Pages**
2. Source: `Deploy from a branch`
3. Branch: `main` / `(root)` 선택 → **Save**
4. 약 1~2분 후 `https://[계정명].github.io/[레포명]/` 으로 접속 가능

## 사용 방법

- **입장**: 이름 + 팀 비밀번호 입력
- **새 메모**: `+` 버튼 클릭
- **편집**: 메모 클릭 후 바로 작성 (자동 저장)
- **실시간 공유**: 다른 팀원이 편집 중이면 상단에 표시됨
- **삭제**: 메모 선택 후 `삭제` 버튼

## 팀원에게 공유할 정보

- URL: `https://[계정명].github.io/[레포명]/`
- 비밀번호: (설정한 팀 비밀번호)
