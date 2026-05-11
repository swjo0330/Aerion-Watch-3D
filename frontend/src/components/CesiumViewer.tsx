"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useDroneStore } from "@/store/droneStore";
import { useMissionStore, Waypoint } from "@/store/missionStore";
import type { TracePoint } from "@/types/drone";

// ── 고도 색상 (Tactical Obsidian Style: Orange Dominant) ───────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function altColor(altAto: number, Cesium: any) {
  if (altAto <= 50) return Cesium.Color.fromCssColorString("#ff5c00"); // Primary Orange
  if (altAto <= 100) return Cesium.Color.fromCssColorString("#ffb59a"); // Light Orange
  return Cesium.Color.fromCssColorString("#47e266"); // Tertiary Green
}

interface DroneGroup {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  point: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  label: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  polyline: any | null;
}

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cesiumReady, setCesiumReady] = useState(false);
  const pathname = usePathname();

  // 최신 상태를 이벤트 핸들러에서 참조하기 위한 Refs
  const currentPathRef = useRef(pathname);
  useEffect(() => { currentPathRef.current = pathname; }, [pathname]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateRef = useRef<{
    viewer: any;
    Cesium: any;
    points: any;          // PointPrimitiveCollection
    labels: any;          // LabelCollection
    polylines: any;       // PolylineCollection
    drones: Map<string, DroneGroup>;
    googleTileset: any | null;
    vworldTileset: any | null;
    missionRoutePolyline: any | null;
    missionWaypoints: Map<string, any>; // PointPrimitives for waypoints
    missionLabels: Map<string, any>;    // Labels for waypoints
  }>({
    viewer: null,
    Cesium: null,
    points: null,
    labels: null,
    polylines: null,
    drones: new Map(),
    googleTileset: null,
    vworldTileset: null,
    missionRoutePolyline: null,
    missionWaypoints: new Map(),
    missionLabels: new Map(),
  });

  const { activeMapLayer, selectDrone } = useDroneStore();
  const { waypoints, addWaypoint, activeWaypointId, setActiveWaypoint } = useMissionStore();

  const addWaypointRef = useRef(addWaypoint);
  const selectDroneRef = useRef(selectDrone);
  const setActiveWaypointRef = useRef(setActiveWaypoint);

  useEffect(() => {
    addWaypointRef.current = addWaypoint;
    selectDroneRef.current = selectDrone;
    setActiveWaypointRef.current = setActiveWaypoint;
  }, [addWaypoint, selectDrone, setActiveWaypoint]);

  // Map Layer 토글
  useEffect(() => {
    const s = stateRef.current;
    if (s.googleTileset) {
      s.googleTileset.show = activeMapLayer === "google";
    }
    if (s.vworldTileset) {
      s.vworldTileset.show = activeMapLayer === "vworld";
    }
  }, [activeMapLayer]);

  // ── Cesium Viewer 초기화 (마운트 1회) ──────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const s = stateRef.current;

    // Web Workers(KTX2/Draco Transcoder) 경로 보장 (VWorld 텍스처 하얀색 버그의 핵심 원인 해결)
    if (typeof window !== "undefined") {
      (window as any).CESIUM_BASE_URL = "/cesium";
    }

    import("cesium").then((Cesium) => {
      if (!containerRef.current || s.viewer) return;

      if (process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN) {
        Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      }

      const viewer = new Cesium.Viewer(containerRef.current, {
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: false,
        // @ts-ignore
        terrainProvider: Cesium.createWorldTerrain(),
        contextOptions: {
          requestWebgl1: true,
        },
      });

      // 불필요한 렌더링 오버헤드 제거
      viewer.scene.fog.enabled = false;
      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.showGroundAtmosphere = false;

      // ── Primitive 컬렉션 ─────────────────────
      const points = new Cesium.PointPrimitiveCollection();
      const labels = new Cesium.LabelCollection();
      const polylines = new Cesium.PolylineCollection();
      viewer.scene.primitives.add(points);
      viewer.scene.primitives.add(polylines);
      viewer.scene.primitives.add(labels); // 라벨을 맨 위에 렌더링

      // Google Photorealistic 3D Tiles
      Cesium.IonResource.fromAssetId(2275207).then((url: any) => {
        const googleTileset = new Cesium.Cesium3DTileset({ 
          // @ts-ignore
          url: url 
        });
        // @ts-ignore
        googleTileset.readyPromise.then(() => {
          if (!viewer.isDestroyed()) {
            viewer.scene.primitives.add(googleTileset);
            s.googleTileset = googleTileset;
            googleTileset.show = useDroneStore.getState().activeMapLayer === "google";
          }
        }).catch((err: any) => {
          console.error("Failed to load Google Photorealistic 3DTiles:", err);
        });
      });

      // VWorld 구형 데이터
      const vworldTileset = new Cesium.Cesium3DTileset({
        // @ts-ignore
        url: "https://xdworld.vworld.kr/TDServer/services/facility_LOD4/vworld_3d_facility.json",
      });
      // @ts-ignore
      vworldTileset.readyPromise.then(() => {
        if (!viewer.isDestroyed()) {
          vworldTileset.colorBlendMode = Cesium.Cesium3DTileColorBlendMode.REPLACE;
          viewer.scene.primitives.add(vworldTileset);
          s.vworldTileset = vworldTileset;
          vworldTileset.show = useDroneStore.getState().activeMapLayer === "vworld";
        }
      }).catch((err: any) => {
        console.error("Failed to load Vworld 3DTiles:", err);
      });

      s.viewer = viewer;
      s.Cesium = Cesium;
      s.points = points;
      s.labels = labels;
      s.polylines = polylines;

      // requestRenderMode 끄기 -> 60프레임 무조건 그리기 (가장 확실한 갱신 보장)
      viewer.clock.shouldAnimate = true;
      viewer.scene.requestRenderMode = false;

      // 초기 카메라 → 서울
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(126.978, 37.5665, 8000),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-45),
          roll: 0,
        },
      });

      // 통합 클릭 핸들러 (Mission Planner vs Swarm Overview)
      viewer.screenSpaceEventHandler.setInputAction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (click: any) => {
          const isMissionView = currentPathRef.current?.includes("/mission");
          const picked = viewer.scene.pick(click.position);
          
          if (isMissionView) {
            // 미션 뷰: 웨이포인트 선택 또는 새로운 웨이포인트 추가
            if (Cesium.defined(picked) && typeof picked.id === "string" && picked.id.startsWith("wp:")) {
              setActiveWaypointRef.current(picked.id.replace("wp:", ""));
              return;
            }
            
            // 허공 클릭 시 새로운 웨이포인트 추가
            const ray = viewer.camera.getPickRay(click.position);
            if (ray) {
              const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
              if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const lat = Cesium.Math.toDegrees(cartographic.latitude);
                const lng = Cesium.Math.toDegrees(cartographic.longitude);
                // 웨이포인트 추가 (기본 고도 150m)
                addWaypointRef.current(lat, lng, 150);
              }
            }
          } else {
            // 다른 뷰: 드론 선택
            const id: unknown = Cesium.defined(picked) ? picked.id : undefined;
            const droneId = typeof id === "string" && id.startsWith("drone:") ? id.replace("drone:", "") : undefined;
            const cur = useDroneStore.getState().selectedDroneId;
            selectDroneRef.current(droneId ? (droneId === cur ? null : droneId) : null);
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );

      // ── 1. 지속적 렌더링 루프 (React State 변경 배제 직통 조회) ──────────────────
      let flewToSelected = false;

      viewer.scene.preUpdate.addEventListener(() => {
        // 1) 스토어에서 직접 최신 상태 패치 (React 리렌더링과 독립적 작동 보장)
        const storeState = useDroneStore.getState();
        const latestDrones = storeState.drones;
        const currentTraces = storeState.traces;
        const currentSelectedId = storeState.selectedDroneId;

        const droneIds = new Set(Object.keys(latestDrones));

        // 기존 맵에 있는 드론 중 최신 데이터에 없는 것은 삭제 처리
        for (const [id, g] of s.drones.entries()) {
          if (!droneIds.has(id)) {
            s.points.remove(g.point);
            s.labels.remove(g.label);
            if (g.polyline) s.polylines.remove(g.polyline);
            s.drones.delete(id);
          }
        }

        // 갱신 및 추가 처리
        for (const drone of Object.values(latestDrones)) {
          const { drone_id, pos, status, trace } = drone;

          // Cartesian3 좌표 직접 주입
          const position = Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, pos.alt_msl);

          const selected = drone_id === currentSelectedId;
          const color = altColor(pos.alt_ato, Cesium);
          
          const ptColor = selected ? Cesium.Color.fromCssColorString("#ffffff") : color;
          const ptOutlineColor = selected ? Cesium.Color.fromCssColorString("#ff5c00") : Cesium.Color.fromCssColorString("#0e0e0e");
          const ptOutlineWidth = selected ? 3 : 1;
          const ptPixelSize = selected ? 18 : 12;

          const labelBg = selected
            ? Cesium.Color.fromCssColorString("#ff5c00").withAlpha(0.8)
            : Cesium.Color.fromCssColorString("#1c1b1b").withAlpha(0.8);
          const labelText = `${drone_id}\n${pos.alt_ato.toFixed(0)}m`;

          let g = s.drones.get(drone_id);

          if (!g) {
            const point = s.points.add({
              id: `drone:${drone_id}`,
              position,
              color: ptColor,
              pixelSize: ptPixelSize,
              outlineColor: ptOutlineColor,
              outlineWidth: ptOutlineWidth,
              scaleByDistance: new Cesium.NearFarScalar(500, 1.2, 60000, 0.4),
            });

            const label = s.labels.add({
              id: `label:${drone_id}`,
              position,
              text: labelText,
              font: "bold 11px Inter, sans-serif",
              fillColor: Cesium.Color.WHITE,
              style: Cesium.LabelStyle.FILL,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20),
              showBackground: true,
              backgroundColor: labelBg,
              backgroundPadding: new Cesium.Cartesian2(8, 4),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000),
            });

            g = { point, label, polyline: null };
            s.drones.set(drone_id, g);
          } else {
            // 좌표 동기화 (오브젝트 직접 수정)
            g.point.position = position;
            g.point.color = ptColor;
            g.point.pixelSize = ptPixelSize;
            g.point.outlineColor = ptOutlineColor;
            g.point.outlineWidth = ptOutlineWidth;

            g.label.position = position;
            g.label.text = labelText;
            g.label.backgroundColor = labelBg;
          }

          // 궤적 Polyline
          const tracePoints = currentTraces[drone_id] ?? [];
          if (selected && tracePoints.length > 1) {
            const positions = tracePoints.map((p) =>
              Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.alt)
            );
            if (!g.polyline) {
              g.polyline = s.polylines.add({
                positions,
                width: 3,
                material: Cesium.Material.fromType("Color", {
                  color: ptColor.withAlpha(0.8),
                }),
              });
            } else {
              g.polyline.positions = positions;
            }
            if (!flewToSelected) { flewToSelected = true; }
          } else if (!selected && g.polyline) {
            s.polylines.remove(g.polyline);
            g.polyline = null;
          }
        }
      });

      setCesiumReady(true);
    });

    return () => {
      const s = stateRef.current;
      if (s.viewer && !s.viewer.isDestroyed()) {
        s.viewer.destroy();
        s.viewer = null;
        s.Cesium = null;
        s.points = null;
        s.labels = null;
        s.polylines = null;
        s.drones.clear();
        s.missionWaypoints.clear();
        s.missionLabels.clear();
      }
    };
  }, []);

  // ── 2. 미션 플래너 웨이포인트 렌더링 갱신 ──────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    if (!s.viewer || !s.Cesium) return;
    const { Cesium, points, labels, polylines } = s;

    // 현재 화면이 미션 뷰인지 확인
    const isMissionView = pathname?.includes("/mission");

    if (!isMissionView || waypoints.length === 0) {
      // 뷰가 아니거나 웨이포인트가 없으면 모두 지우기
      for (const pt of s.missionWaypoints.values()) points.remove(pt);
      for (const lb of s.missionLabels.values()) labels.remove(lb);
      if (s.missionRoutePolyline) {
        polylines.remove(s.missionRoutePolyline);
        s.missionRoutePolyline = null;
      }
      s.missionWaypoints.clear();
      s.missionLabels.clear();
      return;
    }

    const currentWpIds = new Set(waypoints.map(w => w.id));

    // 제거된 웨이포인트 정리
    for (const [id, pt] of s.missionWaypoints) {
      if (!currentWpIds.has(id)) {
        points.remove(pt);
        s.missionWaypoints.delete(id);
      }
    }
    for (const [id, lb] of s.missionLabels) {
      if (!currentWpIds.has(id)) {
        labels.remove(lb);
        s.missionLabels.delete(id);
      }
    }

    const polylinePositions: any[] = [];

    // 웨이포인트 점 및 라벨 렌더링
    waypoints.forEach(wp => {
       const position = Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat, wp.alt);
       polylinePositions.push(position);
       const selected = wp.id === activeWaypointId;

       const ptColor = selected ? Cesium.Color.WHITE : Cesium.Color.fromCssColorString("#ff5c00");
       const ptOutlineColor = selected ? Cesium.Color.fromCssColorString("#ff5c00") : Cesium.Color.WHITE;
       const ptPixelSize = selected ? 16 : 12;

       let pt = s.missionWaypoints.get(wp.id);
       if (!pt) {
         pt = points.add({
           id: `wp:${wp.id}`,
           position,
           color: ptColor,
           pixelSize: ptPixelSize,
           outlineColor: ptOutlineColor,
           outlineWidth: selected ? 4 : 2,
         });
         s.missionWaypoints.set(wp.id, pt);
       } else {
         pt.position = position;
         pt.color = ptColor;
         pt.pixelSize = ptPixelSize;
         pt.outlineColor = ptOutlineColor;
         pt.outlineWidth = selected ? 4 : 2;
       }

       let lb = s.missionLabels.get(wp.id);
       if (!lb) {
         lb = labels.add({
           id: `wplabel:${wp.id}`,
           position,
           text: wp.id,
           font: "bold 12px Inter, sans-serif",
           fillColor: selected ? Cesium.Color.fromCssColorString("#ff5c00") : Cesium.Color.WHITE,
           style: Cesium.LabelStyle.FILL,
           pixelOffset: new Cesium.Cartesian2(0, -20),
           distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000),
         });
         s.missionLabels.set(wp.id, lb);
       } else {
         lb.position = position;
         lb.fillColor = selected ? Cesium.Color.fromCssColorString("#ff5c00") : Cesium.Color.WHITE;
       }
    });

    // 경로 Polyline 렌더링 (점선)
    if (polylinePositions.length > 1) {
       if (!s.missionRoutePolyline) {
         s.missionRoutePolyline = polylines.add({
           positions: polylinePositions,
           width: 3,
           material: Cesium.Material.fromType("PolylineDash", {
             color: Cesium.Color.fromCssColorString("#ff5c00").withAlpha(0.8),
             dashLength: 20.0,
           }),
         });
       } else {
         s.missionRoutePolyline.positions = polylinePositions;
       }
    } else {
       if (s.missionRoutePolyline) {
         polylines.remove(s.missionRoutePolyline);
         s.missionRoutePolyline = null;
       }
    }
  }, [waypoints, activeWaypointId, pathname, cesiumReady]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    />
  );
}
