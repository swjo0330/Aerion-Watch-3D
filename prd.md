문서 정보
•	문서명: AERION-Watch 실시간 드론 관제 모니터링 시스템 PRD
•	버전: v1.1 (2026.03 기준)
•	작성일: 2026년 3월
 
목차
1.	프로젝트 개요
2.	기술 스택
3.	핵심 기능 요구사항
4.	시스템 아키텍처 및 데이터 흐름
5.	비기능 요구사항 (신규 추가)
6.	가정사항 및 위험 관리 (신규 추가)
7.	단계별 개발 로드맵
8.	부록
 
1. 프로젝트 개요
프로젝트명: SkyWatch-RT (Real-Time Drone Control System)
목적 다수 드론(최대 10대 이상)의 위치, 회전, 센서 데이터를 저지연으로 수집하여 CesiumJS 기반 3D 지형 위에 실시간 시각화하고, 통합 관제·모니터링·제어할 수 있는 플랫폼 구축.
핵심 가치
•	저지연 데이터 동기화 (< 100ms 목표)
•	고정밀 3D 렌더링 (WGS84 + glTF 모델)
•	효율적인 궤적(Trace) 관리 및 메모리 최적화
대상 사용자
•	드론 운영자, 관제 센터 요원, 시험 비행 엔지니어
 
2. 기술 스택
구분	기술 스택	비고
Frontend	Next.js 14+ (App Router) + TypeScript	UI 프레임워크, 대시보드 구축
3D Engine	Resium (CesiumJS for React)	3D 지형, 드론 엔티티, Polyline Trace
Backend	FastAPI (Python 3.12+)	데이터 검증, 고도 계산, WebSocket 브로드캐스트
State 관리	Zustand	프론트엔드 실시간 드론 상태 리듀싱
Communication	WebSocket (FastAPI)	양방향 실시간 스트리밍
3D 모델	glTF / glb 형식	드론 기체 모델 (Blender 또는 Ready Player Me)
기타	Pydantic v2, MAVLink 파싱	데이터 검증 및 드론 프로토콜 지원
 
 

3. 핵심 기능 요구사항
3.1 실시간 3D 관제 맵 (Cesium View)
•	다수 가능한 드론 시각화: WGS84 좌표 기반 glTF 모델 실시간 이동 + 회전 (Yaw/Pitch/Roll 적용)
•	드론 각각의 고도 데이터 산출(3d map에서 시각화를 위한 terrain data를 기준한 수치들을 산출해야함):
o	절대 고도 (MSL: Mean Sea Level) 표시
o	상대 고도 (ATO: Above Take-Off) = 현재 고도 – 이륙 지점 고도 (실시간 계산)
•	드론 각각의 실시간 궤적(Trace):
o	Polyline 엔티티로 경로 표시
o	메모리 최적화: 1,000포인트 초과 또는 10분 경과 시 FIFO 방식으로 오래된 포인트 자동 삭제
3.2 드론 관리 및 모니터링 UI
•	연결 리스트 창: 접속 중인 모든 드론 목록 (드론 ID, 배터리, 상태)
•	텔레메트리 대시보드: 선택 드론 클릭 시 오버레이 표시 (배터리, 속도, GPS 수신율, 센서 상태)
•	양방향 제어: 프론트엔드 → 백엔드 명령 전송 (고도 제한 변경, Return-to-Home, Pause 등)
•	추가 요구 (보강):
o	드론 클릭 시 카메라 자동 포커스 + Fly-To 애니메이션
o	고도별 색상 변화 (0~50m: 녹색, 50~100m: 노랑, 100m+: 빨강)
o	Excel/Sheets 내보내기 (현재 상태 + 최근 5분 궤적 CSV)
 
4. 시스템 아키텍처 및 데이터 흐름
4.1 데이터 흐름도 (기존 + 보강)
1.	Drone → MAVLink/UDP → FastAPI
2.	FastAPI: Pydantic 검증 + 이륙 지점 고도 기준값 저장 + ATO 계산
3.	FastAPI → WebSocket (/ws) JSON 브로드캐스트
4.	Next.js: WebSocket 수신 → Zustand 업데이트 → Resium 3D 재렌더링 (< 0.1초 주기)
4.2 주요 데이터 스키마 (JSON)
JSON
{
  "drone_id": "DRN-001",
  "timestamp": "2026-03-19T07:11:00Z",
  "pos": {
    "lat": 37.5665,
    "lng": 126.9780,
    "alt_msl": 100.5,
    "alt_ato": 15.2
  },
  "rot": { "yaw": 120.5, "pitch": 2.1, "roll": -1.5 },
  "trace": true,
  "status": {
    "battery": 92,
    "gps_fix": "RTK",
    "speed_kmh": 18.5,
    "sensor_health": "OK"
  }
}
4.3 기술 구현 아키텍처 구조도 (Mermaid)

4.4 배포 
- uv 패키징 및 로컬 venv로 필요 python 모듈 포함 가상환경 포함 배포 구조로 구현
- 서버들 실행을 위한 docker compose 내 서버들 일괄 작성 및 이미지 생성 및 배포 실행 자동화 스크립트 작성
- 환경 변수 및 토큰, 세팅값들은 .env, .env.example 에 명세하고config로서 uv패키징에서 실행 시 세팅하도록 따름.

5. 비기능 요구사항 (신규 추가)
•	성능: WebSocket 지연 ≤ 100ms, 10대 드론 동시 처리 시 CPU 사용률 ≤ 70%
•	확장성: Horizontal Scaling 가능 (FastAPI + Redis Pub/Sub)
•	가용성: 99.9% 업타임 (Health Check 엔드포인트 필수)
•	보안:
o	WebSocket JWT 인증
o	Rate Limiting (초당 100 메시지)
o	HTTPS + WSS 강제
•	접근성: 반응형 UI (데스크톱 우선, 모바일 지원)
•	브라우저 지원: Chrome 120+ (Cesium 요구사항)
 
6. 가정사항 및 위험 관리 (신규 추가)
가정사항
•	드론은 MAVLink 2.0 프로토콜 사용
•	실내/실외 모두 WGS84 좌표 제공
•	Cesium Ion 토큰 또는 오프라인 타일 사용 가능
위험 및 대응
위험	확률	영향	대응 방안
WebSocket 연결 끊김	중	높음	자동 재연결 + 상태 캐싱
Cesium 메모리 누수	중	중	Trace 포인트 제한 + 정기 Garbage Collection
드론 좌표 오차	낮음	높음	RTK GPS 권장 + Kalman Filter 옵션
보안 취약점	중	높음	OWASP Top 10 검토 + Penetration Test
 
7. 단계별 개발 로드맵 (기존 + 세부화)
•	Phase 1: 환경 구축 (Next.js + FastAPI Proxy, Cesium Asset 설정) – 1주
•	Phase 2: 실시간 통신 (WebSocket + 가상 드론 제너레이터) – 1주
•	Phase 3: 3D 시각화 (glTF 로드, Trace, 고도 계산) – 2주
•	Phase 4: UI/UX 고도화 + 명령 제어 – 1주
•	Phase 5: 서버들 실행을 위한 docker compose 작성 및 이미지 생성, 배포 자동화 스크립트 + uv 패키징 및 venv로 필요 python 모듈 포함 가상환경 포함 배포 구조 – 1주
•	Phase 6: 테스트 및 최적화, 배포 로컬실행 종료 확인 필수 (성능, 보안) – 1주
•	
총 예상 기간: 6주 (MVP)

