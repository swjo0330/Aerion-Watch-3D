# 🦅 AERION Mind: 차세대 Swarm & LLM 통신 아키텍처 방법론 보고서

대규모 군집 드론(Swarm)의 초저지연 실시간 제어와 대규모 언어 모델(LLM) 기반의 에이전틱(Agentic) 지휘 체계를 통합하기 위한 통신 방법론 및 아키텍처 설계 조사 보고서입니다.

---

## 1. 개요 (Executive Summary)

현대의 전술 GCS(Ground Control Station)는 단순한 데이터 수신기를 넘어, **1) 초다수 객체(Drones)의 고빈도 텔레메트리 처리**와 **2) LLM 에이전트의 비동기적 추론/판단/명령 하달**이라는 서로 다른 성격의 트래픽을 동시에 처리해야 합니다.

이를 해결하기 위해 시스템을 크게 두 가지 레이어로 분리하고, 각각의 특성에 맞는 최적의 프로토콜을 도입하는 하이브리드 아키텍처를 제안합니다.

---

## 2. Layer 1: 관제 UI ↔ LLM 에이전트 (지휘/명령/추론)

LLM 통신은 텍스트의 길이가 길고, 추론(생성)에 시간이 걸리며, 때로는 에이전트 간의 협업(A2A)이 발생합니다. 단순 무식한 REST API만으로는 실시간 피드백을 주거나 복잡한 워크플로우를 감당하기 어렵습니다.

### 💡 제안 방법론: SSE(Server-Sent Events) + NATS (Message Broker)

*   **사용자(UI) ↔ LLM 서버 (명령 입력 및 답변 수신)**:
    *   **입력 (명령 하달)**: `REST API` 또는 `gRPC`. 사용자의 음성이나 텍스트 명령은 단발성이므로 REST 기반의 POST 요청이 적합합니다.
    *   **출력 (추론 과정 및 결과 수신)**: `SSE (Server-Sent Events)`. LLM이 생각하는 과정(Reasoning steps)이나 스트리밍 답변을 프론트엔드로 끊김 없이 밀어주기(Push)에 가장 가볍고 브라우저 친화적인 프로토콜입니다. 양방향인 WebSocket보다 오버헤드가 적습니다.
*   **LLM 에이전트 ↔ 에이전트 (A2A 통신 및 작업 분배)**:
    *   **Google A2A 개념 도입 + NATS Broker**: LLM 에이전트들이 서로 대화하며 계획을 수립(Strategic Planning Loop)하려면, 중앙 집중형 브로커인 **NATS** 나 **Kafka** 가 필수적입니다.
    *   NATS의 Pub/Sub 모델을 사용해, "전술 계획 에이전트"가 분석 결과를 뿌리면, "경로 최적화 에이전트"와 "기체 이상 감지 에이전트"가 이를 구독하여 병렬로 처리한 뒤 다시 브로커로 결과를 반환하는 **비동기 마이크로서비스 구조**가 가장 이상적입니다.

> [!TIP]
> **왜 WebSocket 대신 SSE인가?** 
> LLM 추론 결과를 클라이언트(웹)에서 받는 것은 100% "서버 -> 클라이언트"의 단방향 스트리밍입니다. 양방향 핑퐁이 필요한 WebSocket 대신 HTTP 표준인 SSE를 쓰면 로드밸런싱과 연결 유지가 훨씬 안정적입니다.

---

## 3. Layer 2: 군집 드론 ↔ GCS 백엔드 (실시간 텔레메트리 & 제어)

드론 300~1000대의 고도/위치/배터리 데이터를 초당 10회 이상 쏘아보내는 상황입니다. 이 구간에서 병목이 발생하면 화면이 끊기고 제어 불능 상태에 빠집니다.

### 💡 제안 방법론: Eclipse Zenoh 🚀 (차세대 ROS2 표준) + WebSocket(UI 연동)

전통적인 IoT 프로토콜인 MQTT나 범용 프로토콜인 WebSocket은 드론(엣지 단말)에서 백엔드로 쏘는 원시 데이터 통신용으로는 무겁거나 지연이 발생할 수 있습니다. 

1.  **드론(Swarm) ↔ 백엔드 허브 (Eclipse Zenoh)**
    *   **Zenoh(제논)란?**: 로보틱스와 엣지 컴퓨팅을 위해 설계된 초저지연, 고수율 데이터 중심 프로토콜입니다. 기존 DDS/MQTT를 대체하며 ROS2의 차세대 기본 미들웨어로 채택되었습니다.
    *   **장점**: 드론 대 드론(P2P) 통신과 드론 대 클라우드(V2X) 통신을 모두 동일한 API로 브릿징 없이 처리할 수 있습니다. 수백 대의 드론이 발생시키는 마이크로 패킷을 뭉쳐서(Batch) 백엔드에 꽂아넣는 데 압도적인 성능을 보입니다.
    *   **적용**: 드론 내부의 Companion Computer(라즈베리파이 등)에 Zenoh 라우터를 올려 백엔드의 Zenoh 인프라와 직결합니다.
2.  **백엔드 허브 ↔ GCS 대시보드 UI (WebSocket)**
    *   현재 프로젝트에 구현된 방식입니다. 백엔드에서 Zenoh로 모아진 드론들의 텔레메트리를 `batch_update` JSON 형태로 묶어, React(Cesium) 프론트엔드와 연결된 WebSocket 터널로 초당 60프레임에 맞춰 뿌려줍니다. 브라우저 환경에서는 WebSocket이 여전히 최강자입니다.

---

## 4. 최종 통합 아키텍처 (Unified Architecture Diagram)

```mermaid
graph TD
    %% Users and Interfaces
    Commander((Commander / UI))
    
    %% Frontend
    subgraph "AERION Mind Frontend (Next.js)"
        UI[Dashboard & Cesium 3D]
        UI -- "1. Command (REST)" --> Gateway
        Gateway -- "3. LLM Response Stream (SSE)" --> UI
        Gateway -- "7. Telemetry Stream (WebSocket)" --> UI
    end

    %% Backend Services
    subgraph "Backend Infrastructure (FastAPI / NATS)"
        Gateway[API Gateway]
        
        Broker{{NATS Message Broker}}
        
        LLM1[Strategic Planner Agent]
        LLM2[Route Optimizer Agent]
        LLM3[Anomaly Detector Agent]
        
        Gateway <--> |Agent Tasks| Broker
        Broker <--> |A2A Comms| LLM1
        Broker <--> |A2A Comms| LLM2
        Broker <--> |A2A Comms| LLM3
        
        TelemetryEngine[Telemetry Processing Engine]
        TelemetryEngine -- "6. Batch Payload" --> Gateway
    end

    %% Drone Swarm (Edge)
    subgraph "Swarm Drones (Edge / ROS2)"
        ZenohRouter((Zenoh Router))
        Drone1[Drone 1]
        Drone2[Drone 2]
        DroneN[Drone N...]
        
        Drone1 <--> |P2P Zenoh| Drone2
        Drone1 --> |Telemetry (Zenoh)| ZenohRouter
        Drone2 --> |Telemetry (Zenoh)| ZenohRouter
        DroneN --> |Telemetry (Zenoh)| ZenohRouter
    end

    %% Connections
    LLM1 -. "4. Control Directives" .-> TelemetryEngine
    ZenohRouter ===> |"5. Ultra-low Latency Swarm Data"| TelemetryEngine
```

---

## 5. 결론 및 요약

1. **사용자 ↔ LLM 제어망**: 
   * 단발성 명령은 REST, LLM의 장문 생성 결과 수신은 **SSE(Server-Sent Events)** 채택.
   * 복수의 LLM 에이전트 간 협업(A2A) 및 작업 분배를 위해 백엔드 내부에는 **NATS** 와 같은 경량/초고속 메시지 브로커 도입.
2. **드론 ↔ GCS 텔레메트리망**: 
   * 군집 통신 및 백엔드 전송 구간은 최근 방산/로보틱스 표준으로 급부상 중인 **Eclipse Zenoh** 를 도입하여 통신 오버헤드와 지연율을 극한으로 낮춤.
   * 브라우저(UI) 렌더링을 위해서는 백엔드에서 취합한 데이터를 현재처럼 **WebSocket**을 통해 묶음(Batch) 전송하는 구조 유지.

이러한 **[REST/SSE] + [NATS] + [Zenoh] + [WebSocket]** 의 조합이 구글 레벨의 스케일과 최신 로보틱스 산업에서 요구하는 가장 "모던하고 견고한" 하이브리드 아키텍처 방법론입니다.
