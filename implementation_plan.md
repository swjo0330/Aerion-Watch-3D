# AERION Mind UI/UX Bug Fix Plan

브라우저 Subagent를 통해 `http://localhost:3000`의 전반적인 레이아웃과 클릭 상호작용을 심층 탐색한 결과, 다음과 같은 치명적인 UI 버그들을 발견했습니다. 이를 완벽하게 수정하기 위한 구현 계획을 제안합니다.

## User Review Required
> [!IMPORTANT]
> 아래 수정 계획을 검토하시고 승인해 주시면 즉시 코드를 수정하여 레이아웃을 정상화하겠습니다.

## 🐛 발견된 버그 및 수정 방안 (Proposed Changes)

### 1. [수정] MapLayerToggle 위치 겹침 (Critical)
* **증상**: `MapLayerToggle` (Google 3D / VWorld 토글) 버튼이 화면 하단 중앙(`bottom-8`)에 고정되어 있어, Reasoning Layer의 **Agent Command Terminal** 입력창과 UTM Planner의 **Mission Analysis** 패널을 완전히 가려버립니다.
* **해결**: `MapLayerToggle.tsx`의 위치 속성을 `absolute bottom-8 left-1/2`에서 `fixed bottom-8 left-[300px]` (좌측 사이드바 바로 옆)으로 이동시켜 다른 패널과 절대 겹치지 않게 만듭니다.

### 2. [수정] Top Navigation 버튼 텍스트 줄바꿈 (Minor)
* **증상**: 우측 상단의 `[사용자명] OUT` (예: `ADMIN OUT`) 버튼이 브라우저 너비에 따라 두 줄로 쪼개져 렌더링되어 미관을 해칩니다.
* **해결**: `GcsTopNav.tsx`의 해당 버튼에 `whitespace-nowrap` Tailwind 클래스를 추가하여 강제로 한 줄을 유지시킵니다.

### 3. [수정] 사이드바 더미(Dummy) 링크 UX 개선 (UX)
* **증상**: 사이드바(`GcsSideNav.tsx`)의 `System Health`, `Logs`, `Help` 메뉴가 현재 단순 `div`로 되어 있어 마우스를 올려도 아무 반응이 없어 버그처럼 느껴집니다.
* **해결**: 해당 메뉴들에 `opacity-50 cursor-not-allowed` 클래스를 추가하여 "현재 준비 중인 기능"임을 시각적으로 명확히 인지할 수 있도록 처리합니다.

### 4. [수정] Reasoning Layer 중앙 패널 Z-Index 및 반응형 문제
* **증상**: `Agent Logic Context` 박스가 다른 노드 맵에 의해 가려지거나, 화면을 줄이면 `Heuristic A/B` 패널이 겹쳐서 글씨를 읽을 수 없습니다.
* **해결**: `app/dashboard/agentic/page.tsx` 내부의 절대 좌표(`absolute`, `mt-20`)들을 유연한 Flexbox 레이아웃 갭(`gap`)으로 조정하여 창 크기가 줄어들어도 내용이 겹치지 않도록 방어 로직을 추가합니다.

### 5. [수정] 지도 드론 마커 클릭 판정(Hitbox) 확대
* **증상**: 3D Cesium 지도상의 드론이 1픽셀 수준으로 너무 작게 렌더링되어 선택(클릭)이 매우 어렵습니다.
* **해결**: `CesiumViewer.tsx`에서 드론의 `pixelSize`를 기본 `8` -> `12`로, 선택 시 `14` -> `18`로 키워 클릭 편의성과 시인성을 대폭 상향시킵니다.

---

## Verification Plan
### Manual Verification
1. 브라우저에서 `http://localhost:3000/dashboard/agentic` 접속 시 하단 중앙의 터미널 입력창이 더 이상 가려지지 않는지 확인.
2. 사이드바의 비활성 메뉴에 마우스를 올렸을 때 금지(Not Allowed) 커서가 뜨는지 확인.
3. 3D 맵 위의 드론 마커가 더 커져서 클릭하기 쉬워졌는지 직접 클릭하여 우측 패널 연동 테스트.
