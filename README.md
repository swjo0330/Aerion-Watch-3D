# 🦅 Aerion SkyWatch 3D - System Architecture & Operations Manual
본 문서는 대규모 스웜(Swarm) 관제 플랫폼 **Aerion SkyWatch 3D (Tactical Obsidian GCS)** 의 핵심 아키텍처 구조부터 실행 방법, 개발 간 도출된 주요 필수 기술 패턴들을 기록한 종합 기술 문서입니다.

---

## 1. 시스템 개요 (System Overview)
* **목표**: 300대 이상의 다중 드론(Swarm) 실시간 텔레메트리 데이터를 지연이나 프레임 드랍 없이 부드럽게 3D 지도 렌더링 환경에 투사해, 지휘관이 직관적으로 관제할 수 있는 전술 인터페이스 구현 
* **프론트엔드 (Frontend)**: Next.js (App Router), React, Cesium.js (v1.95.0), Zustand (상태 관리), TailwindCSS
* **백엔드 (Backend)**: FastAPI, Uvicorn, Websockets, Pydantic, Python 3.12 (uv 패키지 매니저 기반)
* **통신 프로토콜**: WebSockets (`ws://`) 단방향 폴링 회피 체계, HTTP REST (인증 및 Health Check)
* **배포 환경**: Docker Compose 기반 컨테이너 오케스트레이션 (Local Development 환경 기준)

---

## 2. 모듈별 심층 구조 (Architecture Details)

### 2.1 백엔드 데이터 시뮬레이션 및 배포 파이프라인
백엔드는 가짜(Dummy) 데이터가 아닌, 파이썬 기반의 물리적 비동기 무한 루프 텔레메트리 시뮬레이터를 가동하여 실제 드론 운용 환경과 거의 동일한 패킷 배포 스트리밍을 구성합니다.

* **동작 원리 (`drone_simulator.py`)**: 
  - FastAPI의 수명주기(Lifespan)와 함께 백그라운드 태스크로 시작합니다.
  - 지정 업데이트 주기(`0.5초`)마다 300대 드론(`_drones`)의 위도, 경도, MSL 고도, ATO 고도, 방위각, 배터리 소모율 등을 동역학적 수학 연산으로 실시간 증감시킵니다.
  - 연산 결과를 Pydantic 모델(`DroneState`)에 통과시켜 각 값이 정상 생존 범위(e.g., 방위각 360도 미만)에 있는지 엄격히 검열 후 JSON화 시킵니다.
* **WebSocket 매니저 (`connection_manager`)**:
  - 변환된 대규모 JSON을 연결된 모든 클라이언트의 브라우저로 한 번에(`batch_update` 형태) 쏘아 보냅니다. 개별 파편 스레드가 아닌 브로드캐스트 로직을 차용하여 병목을 줄였습니다.

### 2.2 프론트엔드 - 3D 엔진 실시간 렌더링 최적화 🌟 *(Key Pattern)*
React 기반의 생태계에서 300대가 넘는 점 객체(Point Primitive)를 초당 60프레임으로 렌더링하면 필연적으로 React의 가상 DOM 비교(Re-render) 병목이 발생하여 시스템이 마비됩니다. 이를 완전히 돌파하기 위해 "역제어 패턴"을 채택했습니다.

* **Zustand를 통한 UI 리액티비티 배제**: 
  - `useWebSocket.ts` 훅이 웹소켓 데이터를 수신하면, React state가 아닌 `useDroneStore` (Zustand) 내부에 곧바로 꽂힙니다.
  - 이 과정에서 Zustand를 구독하고 있는 사이드 패널의 일부 값들(Swarm Health Matrix 등)만 가볍게 리렌더링 됩니다.
* **Cesium preUpdate Loop Hooking (`CesiumViewer.tsx`)**:
  - `viewer.scene.preUpdate`는 Cesium의 내부 WebGL 엔진이 GPU로 그림을 그리기 직전에 항상 불리는 프레임당 이벤트 리스너입니다.
  - 여기서 `useDroneStore.getState().drones`를 통해 React를 거치지 않은 **"날것의 최신 메모리 주소"** 에 직접 접근합니다.
  - 읽어들인 값을 바탕으로 기존 Cesium Map 상에 생성된 `PointPrimitive` 객체의 메모리 포인터 위치(`g.point.position`)를 직접 수정합니다. 이렇게 하면 React 렌더링 부하 0%로 오직 WebGL 연산 능력만큼 화면이 부드럽게 돌아갑니다.

---

## 3. 실행 및 배포 지침 (Execution & Deployment)
이 프로젝트의 주요 종속성과 환경 런타임 제약을 일관성 있게 관리하기 위해 Docker Compose 환경으로 통합 패키징되었습니다.

### 3.1 Docker Compose 시스템 시작
로컬 환경의 소스코드를 수정한 후 반영하거나 초기 실행을 수행할 때 항상 다음 명령어를 사용합니다:
```bash
docker compose up -d --build
```
> [!TIP]
> `--build` 명령어를 항시 포함하는 것이 권장됩니다. 백엔드/프론트엔드의 코드가 변경되었을 때, 도커 캐싱에 의해 옛날 소스코드가 컨테이너 내부로 말려들어가는(Silent Crash) 현상을 방지합니다.

### 3.2 포트 매핑
* **프론트엔드 (UI 접속)**: `http://localhost:3000`
* **백엔드 (API & 문서)**: `http://localhost:8000/docs` (Swagger UI 접근 시)
* **웹소켓 (내부 연동용)**: `ws://localhost:8000/ws` (브라우저 -> 백엔드로의 호스트 라우트 매핑 사용)

### 3.3 접속 및 계정
* 로그인 페이지 (초기화면) 접속 후 **Username**: `admin` / **Password**: `admin` 을 통해 즉시 인가 토큰(JWT, 7일 보장)을 획득하고 Dashboard로 진입합니다. 

---

## 4. 핵심 유지보수 지침 및 트러블슈팅 이력

### ⚠️ Pydantic "360도" 엣지 케이스 예외사고 사례 (매우 중요)
* **증상**: 프론트엔드 화면의 `Swarm Health Matrix`에서 처음 로딩된 드론 숫자가 지속적으로 변하지 않고, 맵 상의 드론이 완전히 멈춰있는 "Silent Crash" 데이터 증발 현상 발생.
* **원인**: 백엔드의 `drone_simulator.py`에서 무작위성 회전 방위각(`yaw`)을 계산할 때 간헐적으로 `round()` 함수가 반올림을 하며 정확히 `360.0` 값을 내보내는 현상 발생. 
* 방위각을 0~359.9 구역 안에 가두는 Pydantic의 `lt=360` 밸리데이션 검사관문이 이를 적발하여 `ValidationError`를 발생시켰으나, 백그라운드 태스크가 이 에러 로그를 메인 터미널로 흘려보내지 못하고 백엔드 루프 시스템 전체가 `Deadlock(교착)` 상태에 빠짐.
* **해결 및 예방 교훈**: 데이터 무한 루프 계산식에서는 `round(d.yaw % 360, 2) % 360` 와 같은 완전한 이중 모듈러 방어 로직이 필요하며, 항상 Task 루프 내에는 예기치 못한 에러가 루프 자체를 터뜨리지 않도록 철저하게 `try-except`와 `logger.error`를 필히 감싸두어야 합니다.

### ⚠️ 브라우저/도커 간 Websocket URL 경로
* 192.168.x.x 형태의 Docker Gateway 컨테이너 내부망 주소가 아니라, 프론트엔드가 접속하는 브라우저인 "Client Host PC" 관점에서 백엔드 서버를 바라볼 수 있어야 합니다. 
* 프론트엔드 환경변수에 명시된 구문 `NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws`은 이 통신이 도커 네트워크망 안에서 이루어지는 것이 아니라, 로컬호스트를 통한 호스트 스루(Host-through) 매핑으로 연결된다는 사실을 명심해야 합니다.
